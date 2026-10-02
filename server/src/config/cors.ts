// Origins allowed to call the API from a browser (REST and Socket.IO).
// The Netlify entries let the deployed frontend reach an API running on a developer's machine.
export const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://unsquare-mern-developer-assignment.netlify.app',
  // Deploy previews and branch deploys, e.g. https://<id>--unsquare-mern-developer-assignment.netlify.app
  /^https:\/\/[a-z0-9-]+--unsquare-mern-developer-assignment\.netlify\.app$/,
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : []),
]
