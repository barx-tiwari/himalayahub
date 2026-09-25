import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowBigDown, ArrowBigUp, Flag, Lock, MessageSquare, Pin } from 'lucide-react';
import Modal from '../ui/Modal';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { relativeTime } from '../../services/timezoneService';

/** Why the current viewer can't take part, or null if they can. */
export function useParticipation() {
  const { user, apiDown } = useAuth();
  if (apiDown) return { can: false, reason: 'The community is offline right now.' };
  if (!user) return { can: false, reason: 'signin' };
  if (!user.emailVerified) return { can: false, reason: 'Confirm your email address to post, comment and vote.' };
  return { can: true, reason: null };
}

export function SignInPrompt({ children = 'to post, comment and vote' }) {
  const loc = useLocation();
  const next = encodeURIComponent(loc.pathname + loc.search);
  return (
    <p className="small muted cm-signin">
      <Link to={`/login?next=${next}`}>Sign in</Link> or <Link to={`/login?mode=register&next=${next}`}>create an account</Link> {children}. You’ll appear under an anonymous name.
    </p>
  );
}

/** Up/down vote with optimistic update; rolls back if the server refuses. */
export function VoteButtons({ kind, id, score, myVote = 0, disabled, compact }) {
  const [state, setState] = useState({ score, myVote });
  const [err, setErr] = useState('');
  const part = useParticipation();
  const cast = async (v) => {
    if (!part.can) { setErr(part.reason === 'signin' ? 'Sign in to vote.' : part.reason); return; }
    const next = state.myVote === v ? 0 : v;
    const prev = state;
    setState({ myVote: next, score: state.score - state.myVote + next }); setErr('');
    try { setState(await api.post(`/community/${kind === 'post' ? 'posts' : 'comments'}/${id}/vote`, { value: next })); }
    catch (e) { setState(prev); setErr(e.message); }
  };
  return (
    <div className={`cm-vote${compact ? ' compact' : ''}`}>
      <button type="button" aria-label="Upvote" aria-pressed={state.myVote === 1} disabled={disabled} onClick={() => cast(1)}><ArrowBigUp aria-hidden="true" /></button>
      <span className="cm-score" aria-label={`Score ${state.score}`}>{state.score}</span>
      <button type="button" aria-label="Downvote" aria-pressed={state.myVote === -1} disabled={disabled} onClick={() => cast(-1)}><ArrowBigDown aria-hidden="true" /></button>
      {err && <span className="cm-vote-err" role="status">{err}</span>}
    </div>
  );
}

export function PostCard({ post, showCommunity = true }) {
  return (
    <article className="card cm-post">
      <VoteButtons kind="post" id={post.id} score={post.score} myVote={post.myVote} disabled={post.isMine} />
      <div className="cm-post-main">
        <p className="cm-meta">
          {showCommunity && <><Link to={`/community/c/${post.community.slug}`} className="cm-comm">{post.community.icon} {post.community.name}</Link> · </>}
          <span className="cm-alias">{post.alias ?? '—'}</span> · <time dateTime={post.createdAt}>{relativeTime(post.createdAt)}</time>
          {post.isPinned && <span className="chip chip-accent"><Pin aria-hidden="true" /> Pinned</span>}
          {post.isLocked && <span className="chip"><Lock aria-hidden="true" /> Locked</span>}
          {post.status === 'PENDING' && <span className="chip chip-warning">Awaiting review</span>}
        </p>
        <h3 className="cm-title"><Link to={`/community/post/${post.id}`}>{post.title}</Link></h3>
        {post.body && <p className="cm-excerpt">{post.body}{post.truncated ? '…' : ''}</p>}
        <p className="cm-actions small"><Link to={`/community/post/${post.id}`}><MessageSquare aria-hidden="true" /> {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</Link></p>
      </div>
    </article>
  );
}

const REASONS = [['SPAM', 'Spam or advertising'], ['HARASSMENT', 'Harassment or bullying'], ['HATE', 'Hate speech'], ['PERSONAL_INFO', 'Shares someone’s private information'], ['MISINFORMATION', 'Dangerous misinformation'], ['ILLEGAL', 'Illegal content'], ['OTHER', 'Something else']];

export function ReportButton({ targetType, targetId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('SPAM');
  const [details, setDetails] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const send = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.post('/community/reports', { targetType, targetId, reason, details: details.trim() || undefined }, { full: true }); setMsg(r.message); }
    catch (err) { setMsg(err.message); } finally { setBusy(false); }
  };
  return (
    <>
      <button type="button" className="linklike small cm-report" onClick={() => { setOpen(true); setMsg(''); }}><Flag aria-hidden="true" /> Report</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Report to moderators">
        {msg ? <><p>{msg}</p><button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>Close</button></> : (
          <form onSubmit={send} className="stack">
            <fieldset className="cm-reasons"><legend className="label">What’s wrong?</legend>
              {REASONS.map(([id, label]) => <label key={id}><input type="radio" name="reason" value={id} checked={reason === id} onChange={() => setReason(id)} /> {label}</label>)}
            </fieldset>
            <div className="field"><label htmlFor="rp-d">Anything else? (optional)</label><textarea id="rp-d" className="textarea" rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} /></div>
            <p className="small muted">Reports are anonymous. The author isn’t told who reported them.</p>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send report'}</button>
          </form>
        )}
      </Modal>
    </>
  );
}
