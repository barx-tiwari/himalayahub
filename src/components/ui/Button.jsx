import { Link } from 'react-router-dom';

/**
 * One button component for actions and links.
 * - `to` renders a router Link, `href` renders an <a>, otherwise a <button>.
 */
export default function Button({
  variant = 'primary', size, block, icon: IconCmp, iconRight: IconRight, to, href,
  className = '', children, type = 'button', ...rest
}) {
  const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, block && 'btn-block', className].filter(Boolean).join(' ');
  const content = (
    <>
      {IconCmp && <IconCmp aria-hidden="true" />}
      {children}
      {IconRight && <IconRight aria-hidden="true" />}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  return <button type={type} className={cls} {...rest}>{content}</button>;
}

export function IconButton({ label, icon: IconCmp, variant = 'ghost', size, className = '', ...rest }) {
  return (
    <button type="button" aria-label={label} title={label} className={['btn', `btn-${variant}`, 'btn-icon', size && `btn-${size}`, className].filter(Boolean).join(' ')} {...rest}>
      <IconCmp aria-hidden="true" />
    </button>
  );
}
