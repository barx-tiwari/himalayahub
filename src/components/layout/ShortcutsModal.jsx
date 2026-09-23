import Modal from '../ui/Modal';
import { useUI } from '../../context/UIContext';

const SHORTCUTS = [
  ['Ctrl / ⌘ + K', 'Open search'],
  ['/', 'Open search'],
  ['?', 'Show this help'],
  ['g then h', 'Go to Home'],
  ['g then x', 'Go to Explore Nepal'],
  ['g then t', 'Go to Typing'],
  ['g then n', 'Go to IT Notes'],
  ['g then d', 'Go to Dashboard'],
  ['g then l', 'Go to Live News'],
  ['g then s', 'Go to Sports'],
  ['g then m', 'Go to Markets'],
  ['g then w', 'Go to Weather'],
  ['g then e', 'Go to Emergency Help'],
  ['Esc', 'Close dialogs · restart a typing test'],
  ['Tab', 'Restart button while typing (then Enter)'],
];

export default function ShortcutsModal() {
  const { shortcutsOpen, setShortcutsOpen } = useUI();
  return (
    <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts">
      <table className="table">
        <thead><tr><th scope="col">Keys</th><th scope="col">Action</th></tr></thead>
        <tbody>
          {SHORTCUTS.map(([k, a]) => (
            <tr key={k}><td><kbd>{k}</kbd></td><td style={{ whiteSpace: 'normal' }}>{a}</td></tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
