/**
 * Email utilities using nodemailer
 */
import nodemailer from 'nodemailer';
declare const transport: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
/**
 * Generates the password-reset email HTML used by the requestReset resolver.
 * @param text - HTML-safe reset body created by the resolver.
 * @returns Full HTML email body.
 * @example
 * makeANiceEmail('Reset link') // => '<div ...>Reset link...</div>'
 */
export declare function makeANiceEmail(text: string): string;
export { transport };
//# sourceMappingURL=mail.d.ts.map