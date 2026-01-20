/**
 * Email utilities using nodemailer
 */
import nodemailer from 'nodemailer';
declare const transport: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
/**
 * Generate a nice HTML email template
 */
export declare function makeANiceEmail(text: string): string;
export { transport };
//# sourceMappingURL=mail.d.ts.map