export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600">

        <div className="grid md:grid-cols-3 gap-8">

          {/* Journal Identity */}
          <div>
            <strong className="text-gray-900 text-base">
              Rwanda Student Journal for Health (RSJH)
            </strong>

            <p className="mt-2">
              An open-access medical research journal promoting scientific
              communication, student research, and healthcare innovation in Rwanda.
            </p>

            <p className="mt-3">
              Published by:
              <br />
              <strong>MedTech Rwanda Ltd</strong>
            </p>
          </div>


          {/* Journal Links */}
          <div>
            <strong className="text-gray-900">
              Journal
            </strong>

            <ul className="mt-3 space-y-2">
              <li>About RSJH</li>
              <li>Editorial Board</li>
              <li>Author Guidelines</li>
              <li>Reviewer Guidelines</li>
              <li>Publication Ethics</li>
            </ul>
          </div>


          {/* Contact */}
          <div>
            <strong className="text-gray-900">
              Editorial Office
            </strong>

            <p className="mt-3">
              Email:
              <br />
              researchrwandahub@gmail.com
            </p>

            <p className="mt-2">
              Phone:
              <br />
              +250 XXX XXX XXX
            </p>

            <p className="mt-3">
              Rwanda
            </p>
          </div>

        </div>


        {/* Bottom */}
        <div className="border-t mt-8 pt-5 text-center">
          <p>
            © {new Date().getFullYear()} MedTech Rwanda Ltd. All rights reserved.
          </p>

          <p className="mt-2">
            RSJH operates with independent peer-review principles and follows
            responsible research publication standards.
          </p>
        </div>

      </div>
    </footer>
  )
}
