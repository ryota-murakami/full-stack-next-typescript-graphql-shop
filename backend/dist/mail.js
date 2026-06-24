/**
 * Email utilities using nodemailer
 */
import nodemailer from 'nodemailer';
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;
const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'localhost',
    port: Number(process.env.MAIL_PORT) || 1025,
    secure: false,
    ...(mailUser && mailPass
        ? {
            auth: {
                user: mailUser,
                pass: mailPass,
            },
        }
        : {}),
});
/**
 * Generates the password-reset email HTML used by the requestReset resolver.
 * @param text - HTML-safe reset body created by the resolver.
 * @returns Full HTML email body.
 * @example
 * makeANiceEmail('Reset link') // => '<div ...>Reset link...</div>'
 */
export function makeANiceEmail(text) {
    return `
    <div style="
      border: 1px solid black;
      padding: 20px;
      font-family: sans-serif;
      line-height: 2;
      font-size: 20px;
    ">
      <h2>Hello There!</h2>
      <p>${text}</p>
      <p>🛒 Full-Stack Shop</p>
    </div>
  `;
}
export { transport };
//# sourceMappingURL=mail.js.map