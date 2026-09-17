'use client';

import { motion } from 'framer-motion';
import { FaTelegramPlane, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { scrollToSection } from '@/lib/landing';

export function Footer() {
  return (
    <footer className="relative pt-16 pb-12 text-xs font-sans text-[#94a3b8] bg-[#050212] border-t border-[#1a1236]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12"
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-[#1f1642]/80">
          
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-5 flex flex-col items-start">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('top');
              }}
              className="group flex items-center gap-3 select-none mb-3.5 transition-transform duration-200 hover:scale-105"
            >
              <img
                src="/assets/rabbit-minimal.webp"
                alt="Tracehop Logo Mascot"
                width={32}
                height={32}
                className="w-[32px] h-[32px] object-contain shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.35)]"
              />
              <div className="relative inline-flex items-baseline font-display font-extrabold text-[24px] sm:text-[26px] tracking-tight leading-none">
                <span className="text-white">Trace</span>
                <span className="bg-gradient-to-br from-[#ff9548] to-[#ff601c] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,120,40,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(255,120,40,0.6)] transition-all">
                  hop
                </span>
                {/* Micro dotted animated trail matching Navbar */}
                <svg className="absolute -bottom-1 -right-1.5 w-7 h-2.5 overflow-visible pointer-events-none" viewBox="0 0 24 8" fill="none">
                  <path d="M1 2 C6 6, 14 6, 20 2" stroke="#ff7a29" strokeWidth="1.3" strokeDasharray="2 2" strokeLinecap="round" className="animate-flowTrail opacity-90" />
                  <circle cx="20" cy="2" r="1.3" fill="#ff7a29" className="animate-pulseDot drop-shadow-[0_0_5px_#ff7a29]" />
                </svg>
              </div>
            </a>
            <p className="text-[#94a3b8] leading-relaxed max-w-sm mb-5 text-xs">
              Onchain intelligence engine that reveals the truth behind every token across Robinhood Chain &amp; EVM ecosystems.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 text-white">
              <a
                href="https://t.me/tracehop_bot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Bot"
                className="w-9 h-9 rounded-xl bg-[#0e0a22] hover:bg-[#7c3aed] text-[#94a3b8] hover:text-white flex items-center justify-center transition-all border border-[#251c47] hover:border-[#a855f7]/60 shadow-sm"
              >
                <FaTelegramPlane className="w-4 h-4 text-[#2AABEE]" />
              </a>
              <a
                href="https://x.com/tracehopauto"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official X Twitter"
                className="w-9 h-9 rounded-xl bg-[#0e0a22] hover:bg-[#7c3aed] text-[#94a3b8] hover:text-white flex items-center justify-center transition-all border border-[#251c47] hover:border-[#a855f7]/60 shadow-sm"
              >
                <FaXTwitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/tracehop-labs/tracehop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-9 h-9 rounded-xl bg-[#0e0a22] hover:bg-[#7c3aed] text-[#94a3b8] hover:text-white flex items-center justify-center transition-all border border-[#251c47] hover:border-[#a855f7]/60 shadow-sm"
              >
                <FaGithub className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-white font-mono text-xs uppercase tracking-wider mb-1">PRODUCT</h5>
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo'); }} className="hover:text-white transition-colors text-xs py-0.5">Live Demo</a>
            <a href="#engine" onClick={(e) => { e.preventDefault(); scrollToSection('engine'); }} className="hover:text-white transition-colors text-xs py-0.5">Features</a>
            <a href="#why" onClick={(e) => { e.preventDefault(); scrollToSection('why'); }} className="hover:text-white transition-colors text-xs py-0.5">Why TraceHop</a>
            <a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }} className="hover:text-white transition-colors text-xs py-0.5">Telemetry</a>
          </div>

          {/* Resources */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-white font-mono text-xs uppercase tracking-wider mb-1">RESOURCES</h5>
            <a href="/portfolio" className="hover:text-white transition-colors text-xs py-0.5">Portfolio</a>
            <a href="https://t.me/tracehop_bot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-xs py-0.5">Telegram Bot</a>
          </div>

          {/* Join the Movement */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 flex flex-col items-start gap-2.5">
            <h5 className="font-bold text-white font-mono text-xs uppercase tracking-wider mb-1">CONNECT &amp; COMMUNITY</h5>
            <a
              href="https://t.me/tracehop_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#0e0a22] hover:bg-[#181138] border border-[#251c47] hover:border-[#7c3aed]/50 text-white text-xs font-medium transition-all w-fit"
            >
              <FaTelegramPlane className="w-3.5 h-3.5 text-[#2AABEE] shrink-0" />
              <span>Telegram Bot (@tracehop_bot)</span>
            </a>
            <a
              href="https://x.com/tracehopauto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#0e0a22] hover:bg-[#181138] border border-[#251c47] hover:border-[#7c3aed]/50 text-white text-xs font-medium transition-all w-fit"
            >
              <FaXTwitter className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Follow @tracehopauto</span>
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#64748b] text-[11px] font-mono">
          <p className="text-center sm:text-left">&copy; 2026 Tracehop. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0c081e] border border-[#1f1738] text-[10.5px] text-[#94a3b8]">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
                <path
                  d="M2.84 24h.53c.096 0 .192-.048.224-.128C7.591 13.696 11.94 8.656 14.67 5.638c.112-.128.064-.225-.096-.225h-4.88a.55.55 0 0 0-.45.225L5.746 9.972c-.514.642-.642 1.236-.642 2.086v4.43c-1.14 3.194-1.862 5.361-2.392 7.32-.032.125.016.192.129.192M20.447.646c-.754-.802-4.157-.834-5.73-.224a3 3 0 0 0-.786.465 41 41 0 0 0-3.323 3.178c-.112.113-.064.225.097.225h5.409c.497 0 .786.289.786.786v6.1c0 .16.128.208.225.064l3.258-4.254c.53-.69.69-.898.835-1.861.192-1.413.08-3.58-.77-4.479m-6.982 16.18 2.231-3.676a.7.7 0 0 0 .064-.29V6.73c0-.16-.112-.225-.224-.097-3.355 3.74-5.971 7.672-8.395 12.407-.06.12.016.225.16.177l5.009-1.54c.565-.174.882-.402 1.155-.852"
                  fill="#CCFF00"
                />
              </svg>
              <span className="text-white font-medium">Robinhood Chain</span>
            </span>
            <span className="text-[#3b3260] hidden sm:inline">•</span>
            <span className="text-[#64748b]">REGIME W14</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
