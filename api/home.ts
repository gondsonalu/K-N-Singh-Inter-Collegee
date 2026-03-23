/* eslint-disable @typescript-eslint/no-explicit-any */
export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    title: "K N Singh Inter College",
    description: "Welcome to K N Singh Inter College, Masuriyapur, Azamgarh. We are dedicated to providing quality education and fostering excellence in our students.",
    stats: [
      { label: "Students", value: "1500+" },
      { label: "Faculty", value: "50+" },
      { label: "Labs", value: "10+" },
      { label: "Experience", value: "25+ Years" }
    ]
  });
}
