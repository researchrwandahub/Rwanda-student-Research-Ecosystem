$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$appPath = Join-Path $root 'pages\_app.tsx'
$seoPath = Join-Path $root 'components\RSRESeoHead.tsx'
$articleSeoPath = Join-Path $root 'components\RSREArticleSeo.tsx'
$robotsPath = Join-Path $root 'pages\robots.txt.ts'
$sitemapPath = Join-Path $root 'pages\sitemap.xml.ts'
$articlePath = Join-Path $root 'pages\articles\[id].tsx'
$envPath = Join-Path $root '.env.example'

foreach ($path in @($appPath,$seoPath,$articleSeoPath,$robotsPath,$sitemapPath)) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Required path not found: $path" }
}

function Backup-Once([string]$path) {
  $backup = "$path.rsre-seo-backup-20260921"
  if (-not (Test-Path -LiteralPath $backup)) {
    Copy-Item -LiteralPath $path -Destination $backup
  }
}

# _app.tsx: inject the SEO head without replacing the current application shell.
$app = Get-Content -Raw -LiteralPath $appPath
if ($app -notmatch 'RSRESeoHead') {
  $imports = [regex]::Matches($app, '(?m)^import .+$')
  if ($imports.Count -eq 0) { throw "Could not safely locate imports in pages/_app.tsx" }
  $last = $imports[$imports.Count - 1]
  Backup-Once $appPath
  $app = $app.Insert($last.Index + $last.Length, "`r`nimport RSRESeoHead from `"../components/RSRESeoHead`";")
  $componentPattern = '(?m)(^\s*)<Component \{\.\.\.pageProps\} />'
  if (-not [regex]::IsMatch($app, $componentPattern)) {
    throw "Could not safely locate <Component {...pageProps} /> in pages/_app.tsx; no application-shell change was saved."
  }
  $app = [regex]::Replace($app, $componentPattern, { param($m) $m.Groups[1].Value + '<RSRESeoHead />' + [Environment]::NewLine + $m.Groups[1].Value + '<Component {...pageProps} />' }, 1)
  Set-Content -LiteralPath $appPath -Value $app -Encoding utf8
  Write-Host "Updated pages/_app.tsx"
} else {
  Write-Host "pages/_app.tsx already contains RSRESeoHead; skipped."
}

# Public article SEO + SSR: only apply against the known current article-page pattern.
if (Test-Path -LiteralPath $articlePath) {
  $article = Get-Content -Raw -LiteralPath $articlePath
  if ($article -notmatch 'RSREArticleSeo') {
    if ($article -notmatch 'interface Article') { throw "Refusing to alter article page: Article interface not found." }
    if ($article -notmatch 'export default function ArticleDetail\(\)') {
      Write-Warning "Article function signature differs from the safe patch; article SEO/SSR was skipped."
    } elseif ($article -notmatch 'const \[loading, setLoading\] = useState\(true\)') {
      Write-Warning "Article loading state differs from the safe patch; article SEO/SSR was skipped."
    } else {
      Backup-Once $articlePath

      if ($article -notmatch 'GetServerSidePropsContext') {
        $article = $article.Replace('import { useRouter } from "next/router";', 'import type { GetServerSidePropsContext } from "next";' + [Environment]::NewLine + 'import { useRouter } from "next/router";')
      }
      $imports = [regex]::Matches($article, '(?m)^import .+$')
      $last = $imports[$imports.Count - 1]
      $article = $article.Insert($last.Index + $last.Length, "`r`nimport RSREArticleSeo from `"../../components/RSREArticleSeo`";")

      $article = $article -replace 'export default function ArticleDetail\(\)\s*\{', 'export default function ArticleDetail({ initialArticle }: { initialArticle?: Article }) {'
      $article = $article -replace 'useState<Article \| null>\(null\)', 'useState<Article | null>(initialArticle ?? null)'
      $article = $article -replace 'const \[loading, setLoading\] = useState\(true\);', 'const [loading, setLoading] = useState(!initialArticle);'
      $article = $article -replace 'if\(id\) loadArticle\(\);', 'if(id && !initialArticle) loadArticle();'
      $article = $article -replace '\}, \[id\]\);', '}, [id, initialArticle]);'

      $ssr = @'

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const id = String(params?.id || '')
  const configured = process.env.NEXT_PUBLIC_API_URL || ''

  if (!id || !configured) {
    return { props: { initialArticle: null } }
  }

  const clean = configured.replace(/\/$/, '')
  const base = clean.endsWith('/api') ? clean : `${clean}/api`

  try {
    const response = await fetch(`${base}/articles/${encodeURIComponent(id)}/`)
    if (response.status === 404) return { notFound: true }
    if (!response.ok) return { props: { initialArticle: null } }

    const initialArticle = await response.json()
    return { props: { initialArticle } }
  } catch {
    return { props: { initialArticle: null } }
  }
}
'@
      $marker = 'export default function ArticleDetail'
      $article = $article.Replace($marker, $ssr + "`r`n$marker")

      $anchorPattern = '(?m)(\s*)(<article\s+className=)'
      if (-not [regex]::IsMatch($article, $anchorPattern)) {
        throw "Could not safely locate the public article content anchor; article page was not saved."
      }
      $article = [regex]::Replace($article, $anchorPattern, { param($m) $m.Groups[1].Value + '<RSREArticleSeo article={article} />' + [Environment]::NewLine + $m.Groups[1].Value + $m.Groups[2].Value }, 1)
      Set-Content -LiteralPath $articlePath -Value $article -Encoding utf8
      Write-Host "Added article SSR + page-specific SEO metadata to pages/articles/[id].tsx"
    }
  } else {
    Write-Host "pages/articles/[id].tsx already contains RSREArticleSeo; skipped."
  }
}

if (Test-Path -LiteralPath $envPath) {
  $env = Get-Content -Raw -LiteralPath $envPath
  if ($env -notmatch '(?m)^NEXT_PUBLIC_SITE_URL=') {
    Add-Content -LiteralPath $envPath -Value "`r`nNEXT_PUBLIC_SITE_URL=https://rsre-frontend.onrender.com"
    Write-Host "Added NEXT_PUBLIC_SITE_URL to .env.example"
  }
}

Write-Host "Added/verified: /robots.txt and /sitemap.xml"
Write-Host "No Git commit or push was performed."
Write-Host "Next: npm run build, deploy, then verify the production routes and Search Console."
