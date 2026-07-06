import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface RelatedLink {
  label: string;
  to: string;
  icon?: React.FC<{ size?: number; className?: string }>;
  description?: string;
}

interface RelatedToolsProps {
  title?: string;
  links: RelatedLink[];
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({
  title = 'Related Tools',
  links,
}) => {
  if (links.length === 0) return null;

  return (
    <div className="p-5 border border-border bg-surface rounded-xl shadow-sm space-y-3">
      <h3 className="font-bold text-text text-sm">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-bg/50 hover:bg-brand-soft hover:border-brand-soft text-xs font-semibold text-muted hover:text-brand transition-all group"
          >
            {link.icon && <link.icon size={14} className="shrink-0" />}
            <span>{link.label}</span>
            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};
