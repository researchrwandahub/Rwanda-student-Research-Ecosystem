import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/academy/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
    });

    const text = await response.text();

    res.status(response.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error("ACADEMY PROXY ERROR:", error);
    res.status(502).json({
      detail: "Academy backend is unavailable.",
    });
  }
}
