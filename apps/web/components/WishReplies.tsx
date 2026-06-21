import type { WishReply } from "@vibeking/shared";
import type { Locale } from "@/lib/locale";
import { labels, formatDate, t } from "@/lib/i18n";

type Props = {
  locale: Locale;
  replies: WishReply[];
  error?: string;
  replyAction: (formData: FormData) => Promise<void>;
};

export function WishReplies({ locale, replies, error, replyAction }: Props) {
  return (
    <section className="section">
      <h2>{t(labels.wish.replies, locale)}</h2>
      <p className="meta-muted">{t(labels.wish.replyRateLimitHint, locale)}</p>
      {error && <p className="error-banner">{error}</p>}
      <form action={replyAction} className="card form-stack">
        <label>
          {t(labels.wish.replyNickname, locale)}
          <input name="nickname" className="input" maxLength={50} placeholder="路人甲" />
        </label>
        <label>
          {t(labels.wish.replies, locale)}
          <textarea
            name="body"
            className="input textarea"
            rows={4}
            required
            maxLength={2000}
            placeholder={t(labels.wish.replyPlaceholder, locale)}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          {t(labels.wish.replySubmit, locale)}
        </button>
      </form>
      {replies.length === 0 ? (
        <p className="empty-state">{t(labels.wish.noReplies, locale)}</p>
      ) : (
        <ul className="reply-list">
          {replies.map((reply) => (
            <li key={reply.id} className="card reply-card">
              <div className="reply-meta">
                <strong>{reply.displayName}</strong>
                <span className="meta-muted">{formatDate(reply.createdAt, locale)}</span>
              </div>
              <p>{reply.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}