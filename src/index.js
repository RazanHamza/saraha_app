import bootstrap from "./app.bootstrap.js";
import sendEmail from './common/service/sendEmail.js';
import { resolve } from "node:path";



bootstrap();
// sendEmail({
//   to: "razanhamza2775@gmail.com",
//   subject: "razan hamza",
//   html: "<h1>hello</h1>",
//   attachments: [
//     {
//       fileName: "ammar.jpg",
//       path: resolve(
//         "uploads/admin/132ae299-b1ed-40d2-ba4e-9989ddd75f35__f266341ad6154425803bcb453a36bf40.jpg"
//       ),
//     },
//   ],
// });

