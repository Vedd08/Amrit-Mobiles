import { BRANCHES } from '@/shared/business';
import { branchAddress } from '@/shared/branches';
import { WhatsAppIcon } from '@/frontend/components/icons';
import { BranchChatButton } from '@/frontend/components/whatsapp/BranchChatButton';

export function Act06Stores() {
  return (
    <section id="stores" data-act="stores" className="md:min-h-screen py-16 md:py-0 relative px-6 md:py-24 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="reveal-up text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-ink mb-6">Visit a store</h2>
          <p className="text-ink-2 text-xl">We have {BRANCHES.length} branches across Surat.</p>
        </div>

        {/* TODO(owner): real branch photo */}

        <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRANCHES.map(branch => (
            <div key={branch.slug} className="bg-white border border-line p-8 rounded-3xl shadow-sm flex flex-col">
              <h3 className="font-bold text-2xl mb-1">{branch.name}</h3>
              <p className="text-ink-2 text-lg">
                {branch.area}
                {branch.note && <span className="text-lime-ink font-semibold"> · {branch.note}</span>}
              </p>
              <p className="text-ink-3 text-sm leading-relaxed mt-3 mb-8">{branchAddress(branch)}</p>
              <div className="mt-auto pt-6 border-t border-line flex items-center justify-between gap-4">
                <a href={branch.maps} target="_blank" rel="noopener noreferrer" className="text-lime-ink font-bold text-lg hover:underline flex items-center gap-2">
                  Get directions <span>→</span>
                </a>
                <BranchChatButton
                  branch={branch}
                  className="inline-flex items-center gap-2 rounded-full bg-lime/15 px-4 py-2 text-sm font-bold text-lime-ink transition-colors hover:bg-lime/25"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Chat
                </BranchChatButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
