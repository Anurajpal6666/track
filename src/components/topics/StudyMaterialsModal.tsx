"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store/useStore";
import { Topic, StudyMaterial, MaterialType } from "@/lib/types";
import {
  FileText,
  Video,
  ExternalLink,
  BookOpen,
  Plus,
  Trash2,
  FileCheck,
  Upload,
} from "lucide-react";

interface StudyMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
}

export const StudyMaterialsModal: React.FC<StudyMaterialsModalProps> = ({
  isOpen,
  onClose,
  topic,
}) => {
  const { db, currentUser, addStudyMaterial, deleteStudyMaterial } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MaterialType>("pdf");
  const [contentUrl, setContentUrl] = useState("");
  const [description, setDescription] = useState("");

  if (!topic) return null;

  const topicMaterials = db.studyMaterials.filter((m) => m.topicId === topic.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = () => {
      setContentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentUrl.trim()) return;

    addStudyMaterial({
      topicId: topic.id,
      subjectId: topic.subjectId,
      title: title.trim(),
      type,
      contentUrl: contentUrl.trim(),
      description: description.trim(),
      isPrivate: false,
    });

    setTitle("");
    setContentUrl("");
    setDescription("");
    setIsAdding(false);
  };

  const getIconForType = (mType: MaterialType) => {
    switch (mType) {
      case "pdf":
        return <FileText className="w-4 h-4 text-[#D8B668]" />;
      case "video_url":
        return <Video className="w-4 h-4 text-rose-400" />;
      case "doc_url":
        return <ExternalLink className="w-4 h-4 text-blue-400" />;
      case "note":
      default:
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Study Materials: ${topic.name}`}
      subtitle="PDFs, YouTube Lectures, Documentation & Shared Notes"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Header toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="text-xs text-slate-400">
            <span>{topicMaterials.length} shared materials available</span>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 rounded-lg bg-[#C5A059] text-[#080A0F] font-bold text-xs flex items-center gap-1 hover:bg-[#D8B668] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAdding ? "Cancel" : "Add Material"}
          </button>
        </div>

        {/* Add Material Form */}
        {isAdding && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 rounded-xl bg-[#141A26] border border-white/[0.08] space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Add New Study Material
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Material Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Layout Notes or Lecture Link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[#0E121B] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MaterialType)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[#0E121B] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="pdf">PDF Document / Cheatsheet</option>
                  <option value="video_url">YouTube Video Lecture</option>
                  <option value="doc_url">Documentation / Article Link</option>
                  <option value="note">Written Notes</option>
                </select>
              </div>
            </div>

            {type === "pdf" ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  PDF File Upload or Web Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... or choose file on right"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#0E121B] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
                  />
                  <label className="px-3 py-2 rounded-lg bg-[#1F2839] hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer flex items-center gap-1 border border-white/[0.08]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : type === "note" ? (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Note Content
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write clear, condensed study notes here..."
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg bg-[#0E121B] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  URL / Link (YouTube or Docs)
                </label>
                <input
                  type="url"
                  required
                  placeholder={
                    type === "video_url"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://docs.oracle.com/..."
                  }
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[#0E121B] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Description / Context (Optional)
              </label>
              <input
                type="text"
                placeholder="Key takeaways or chapter highlights"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#0E121B] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 text-xs font-medium hover:bg-white/[0.08]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#C5A059] text-[#080A0F] font-bold text-xs hover:bg-[#D8B668]"
              >
                Save Material
              </button>
            </div>
          </form>
        )}

        {/* Existing Materials List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {topicMaterials.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#141A26]/40 border border-white/[0.04] space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No study materials added for this topic yet.</p>
              <p className="text-[11px] text-slate-500">
                Click &ldquo;Add Material&rdquo; above to attach PDFs, YouTube lectures, or notes.
              </p>
            </div>
          ) : (
            topicMaterials.map((mat) => {
              const isYoutube = mat.type === "video_url" && mat.contentUrl.includes("youtube.com");
              const isNote = mat.type === "note";

              return (
                <div
                  key={mat.id}
                  className="p-3.5 rounded-xl bg-[#141A26] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-[#0E121B] border border-white/[0.06] flex-shrink-0 mt-0.5">
                        {getIconForType(mat.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{mat.title}</h4>
                        {mat.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{mat.description}</p>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          Uploaded by {mat.uploadedBy} • {mat.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => deleteStudyMaterial(mat.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Delete material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content viewer / action */}
                  {isNote ? (
                    <div className="p-2.5 rounded-lg bg-[#0E121B] border border-white/[0.04] text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {mat.contentUrl}
                    </div>
                  ) : (
                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={mat.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#D8B668] hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Open Resource <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
