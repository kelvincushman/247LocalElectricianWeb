const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.247electrician.uk',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'info@247electrician.uk',
        pass: process.env.EMAIL_PASS || '',
      },
    });
  }
  return transporter;
}

function getImapConfig() {
  return {
    host: process.env.IMAP_HOST || 'imap.247electrician.uk',
    port: parseInt(process.env.IMAP_PORT || '993'),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'info@247electrician.uk',
      pass: process.env.EMAIL_PASS || '',
    },
    logger: false,
  };
}

async function sendEmail({ to, subject, text, html, replyTo, inReplyTo, references }) {
  const transport = getTransporter();
  const result = await transport.sendMail({
    from: `"247Electrician" <${process.env.EMAIL_USER || 'info@247electrician.uk'}>`,
    to,
    subject,
    text,
    html,
    replyTo,
    inReplyTo,
    references,
  });
  return result;
}

async function fetchInbox({ limit = 20, unseen = true } = {}) {
  const client = new ImapFlow(getImapConfig());
  const messages = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const searchCriteria = unseen ? { seen: false } : { all: true };
      const uids = await client.search(searchCriteria);
      const uidSlice = uids.slice(-limit);

      if (uidSlice.length > 0) {
        for await (const msg of client.fetch(uidSlice, {
          envelope: true,
          source: false,
          bodyStructure: true,
          uid: true,
        })) {
          messages.push({
            uid: msg.uid,
            messageId: msg.envelope.messageId,
            from: msg.envelope.from?.[0]
              ? `${msg.envelope.from[0].name || ''} <${msg.envelope.from[0].address}>`
              : 'Unknown',
            fromAddress: msg.envelope.from?.[0]?.address || '',
            to: msg.envelope.to?.map(t => t.address).join(', ') || '',
            subject: msg.envelope.subject || '(No Subject)',
            date: msg.envelope.date,
            inReplyTo: msg.envelope.inReplyTo || null,
          });
        }
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch (err) {
    console.error('[MCP Email] IMAP error:', err.message);
    try { await client.logout(); } catch (e) { /* ignore */ }
    throw err;
  }

  return messages;
}

module.exports = { sendEmail, fetchInbox, getTransporter, getImapConfig };
