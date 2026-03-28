"use client";

import { motion } from "framer-motion";
import { BookOpen, Play, FileText, Code, Globe, ExternalLink } from "lucide-react";
import type { Resource } from "@/types";

const typeConfig: Record<Resource["type"], { icon: React.ElementType; color: string; label: string }> = {
  youtube: { icon: Play, color: "text-tertiary bg-tertiary/10", label: "Video" },
  article: { icon: FileText, color: "text-primary bg-primary/10", label: "Article" },
  course: { icon: BookOpen, color: "text-secondary bg-secondary/10", label: "Course" },
  docs: { icon: Globe, color: "text-primary-container bg-primary-container/10", label: "Docs" },
  project: { icon: Code, color: "text-primary bg-primary/10", label: "Project" },
};

export default function ResourcesSection({ resources }: { resources: Resource[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline text-xl font-bold">Recommended Resources</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Curated for your next steps — no fluff
          </p>
        </div>
        <BookOpen className="w-5 h-5 text-secondary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, i) => {
          const config = typeConfig[resource.type];
          const Icon = config.icon;

          return (
            <motion.a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="group bg-surface-container-high rounded-xl p-5 border border-outline-variant/10 hover:border-primary/30 transition-all flex gap-4"
            >
              <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-headline font-bold text-sm truncate group-hover:text-primary transition-colors">
                    {resource.title}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-outline opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                  {config.label}
                </span>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {resource.reason}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
