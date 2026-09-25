import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Reply, Trash2 } from 'lucide-react';
import Alert from '../components/ui/Alert';
import CaptureGuard from '../components/security/CaptureGuard';
import { ReportButton, SignInPrompt, VoteButtons, useParticipation } from '../components/community/shared';
import { api } from '../api/client';
import { useApi } from '../api/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { relativeTime } from '../services/timezoneService';

function CommentForm({ postId, parentId, onDone, autoFocus }) {
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); if (!body.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const r = await api.post(`/community/posts/${postId}/comments`, { body: body.trim(), parentId }, { full: true });
      setBody(''); if (r.data.held) setMsg({ type: 'warning', text: r.message }); onDone?.();
    } catch (err) { setMsg({ type: 'error', text: err.message }); } finally { setBusy(false); }
  };
  return (
    <form className="cm-cform" onSubmit={submit}>
      <label className="sr-only" htmlFor={`c-${parentId || 'root'}`}>{parentId ? 'Reply' : 'Add a comment'}</label>
      <textarea id={`c-${parentId || 'root'}`} className="textarea" rows={3} maxLength={5000} placeholder={parentId ? 'Write a reply…' : 'Add to the discussion…'} value={body} onChange={(e) => setBody(e.target.value)} autoFocus={autoFocus} />
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !body.trim()}>{busy ? 'Sending…' : parentId ? 'Reply' : 'Comment'}</button>
    </form>
  );
}

function Comment({ c, postId, locked, reload }) {
  const part = useParticipation();
  const [replying, setReplying] = useState(false);
  const visible = c.status === 'VISIBLE';
  const del = async () => { if (window.confirm('Delete your comment?')) { await api.del(`/community/comments/${c.id}`).catch(() => {}); reload(); } };
  return (
    <li className={`cm-comment depth-${Math.min(c.depth, 6)}`}>
      <div className="cm-comment-body">
        <p className="cm-meta"><span className="cm-alias">{c.alias ?? '—'}</span>{c.isOp && <span className="chip chip-primary">OP</span>}{c.isMine && <span className="chip">You</span>} · <time dateTime={c.createdAt}>{relativeTime(c.createdAt)}</time>{c.editedAt && ' · edited'}</p>
        <p className={visible ? 'cm-text' : 'cm-text muted'}>{c.body}</p>
        {visible && (
          <div className="cm-comment-actions">
            <VoteButtons kind="comment" id={c.id} score={c.score} myVote={c.myVote} disabled={c.isMine} compact />
            {!locked && part.can && <button type="button" className="linklike small" onClick={() => setReplying((r) => !r)}><Reply aria-hidden="true" /> Reply</button>}
            {c.isMine ? <button type="button" className="linklike small" onClick={del}><Trash2 aria-hidden="true" /> Delete</button> : <ReportButton targetType="COMMENT" targetId={c.id} />}
          </div>
        )}
        {replying && <CommentForm postId={postId} parentId={c.id} autoFocus onDone={() => { setReplying(false); reload(); }} />}
      </div>
      {c.replies?.length > 0 && <ul className="cm-replies">{c.replies.map((r) => <Comment key={r.id} c={r} postId={postId} locked={locked} reload={reload} />)}</ul>}
    </li>
  );
}

export default function CommunityPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, status, error, refetch } = useApi(`/community/posts/${id}`);
  const part = useParticipation();
  const reload = useCallback(() => refetch(), [refetch]);
  useDocumentTitle(data?.post?.title || 'Community');

  if (status === 'loading') return <div className="container page"><div className="card" role="status" aria-label="Loading"><span className="skeleton title" /><span className="skeleton" /><span className="skeleton" /></div></div>;
  if (status === 'error') return <div className="container page"><Alert type="error" action={<Link className="btn btn-sm btn-secondary" to="/community">Back to community</Link>}>{error?.status === 404 ? 'This post doesn’t exist or was removed.' : error?.message}</Alert></div>;
  const { post, comments } = data;
  const removeMine = async () => { if (window.confirm('Delete your post? This can’t be undone.')) { await api.del(`/community/posts/${post.id}`); navigate(`/community/c/${post.community.slug}`); } };

  return (
    <div className="container page cm-page cm-thread" data-domain="nepal">
      <p className="small"><Link to={`/community/c/${post.community.slug}`}><ArrowLeft aria-hidden="true" className="inline-ico" /> {post.community.icon} {post.community.name}</Link></p>
      <CaptureGuard>
        <article className="card cm-post cm-post-full">
          <VoteButtons kind="post" id={post.id} score={post.score} myVote={post.myVote} disabled={post.isMine || post.status !== 'VISIBLE'} />
          <div className="cm-post-main">
            <p className="cm-meta"><span className="cm-alias">{post.alias ?? '—'}</span> · <time dateTime={post.createdAt}>{relativeTime(post.createdAt)}</time>{post.editedAt && ' · edited'}</p>
            <h1 className="cm-title">{post.title}</h1>
            {post.status === 'PENDING' && <Alert type="warning">Only you can see this post until a moderator approves it.</Alert>}
            {post.body && <div className="cm-text">{post.body}</div>}
            {post.linkUrl && <p><a href={post.linkUrl} target="_blank" rel="noopener noreferrer nofollow ugc">{new URL(post.linkUrl).hostname} <ExternalLink aria-hidden="true" className="inline-ico" /></a></p>}
            <div className="cm-comment-actions">
              {post.isMine ? <button type="button" className="linklike small" onClick={removeMine}><Trash2 aria-hidden="true" /> Delete post</button> : <ReportButton targetType="POST" targetId={post.id} />}
            </div>
          </div>
        </article>

        <section className="cm-discussion" aria-labelledby="cm-disc">
          <h2 id="cm-disc">{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</h2>
          {post.isLocked ? <Alert type="info">Moderators locked this discussion. You can still read it.</Alert>
            : part.can ? (post.status === 'VISIBLE' && <CommentForm postId={post.id} onDone={reload} />)
            : part.reason === 'signin' ? <SignInPrompt children="to join the discussion" /> : <Alert type="info">{part.reason}</Alert>}
          {comments.length ? <ul className="cm-comments">{comments.map((c) => <Comment key={c.id} c={c} postId={post.id} locked={post.isLocked} reload={reload} />)}</ul>
            : <p className="muted">No comments yet.</p>}
        </section>
      </CaptureGuard>
    </div>
  );
}
