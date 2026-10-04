"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store/useStore";
import { Topic, Priority, Difficulty, AssignedTo } from "@/lib/types";
import { Plus, X } from "lucide-react";

interface TopicEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicToEdit?: Topic | null;
}

export const TopicEditorModal: React.FC<TopicEditorModalProps> = ({
  isOpen,
  onClose,
  topicToEdit,
}) => {
  const { db, addTopic, updateTopic, deleteTopic } = useStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState(db.subjects[0]?.id || "sub-c");
  const [priority, setPriority] = useState<Priority>("HIGH");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [estimatedHours, setEstimatedHours] = useState(10);
  const [assignedTo, setAssignedTo] = useState<AssignedTo>("all");
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [newSubtopic, setNewSubtopic] = useState("");

  useEffect(() => {
    if (topicToEdit) {
      setName(topicToEdit.name);
      setDescription(topicToEdit.description);
      setSubjectId(topicToEdit.subjectId);
      setPriority(topicToEdit.priority);
      setDifficulty(topicToEdit.difficulty);
      setEstimatedHours(topicToEdit.estimatedHours);
      setAssignedTo(topicToEdit.assignedTo);
      setSubtopics(topicToEdit.subtopics || []);
    } else {
      setName("");
      setDescription("");
      setSubjectId(db.subjects[0]?.id || "sub-c");
      setPriority("HIGH");
      setDifficulty("MEDIUM");
      setEstimatedHours(10);
      setAssignedTo("all");
      setSubtopics([]);
    }
  }, [topicToEdit, db.subjects]);

  const handleAddSubtopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtopic.trim()) return;
    setSubtopics([...subtopics, newSubtopic.trim()]);
    setNewSubtopic("");
  };

  const handleRemoveSubtopic = (index: number) => {
    setSubtopics(subtopics.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (topicToEdit) {
      updateTopic(topicToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        subjectId,
        priority,
        difficulty,
        estimatedHours,
        assignedTo,
        subtopics,
      });
    } else {
      addTopic({
        name: name.trim(),
        description: description.trim(),
        subjectId,
        categoryId: `cat-${subjectId}`,
        priority,
        difficulty,
        estimatedHours,
        assignedTo,
        orderIndex: db.topics.length + 1,
        isActive: true,
        subtopics,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!topicToEdit) return;
    if (confirm(`Permanently delete topic: "${topicToEdit.name}"?`)) {
      deleteTopic(topicToEdit.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={topicToEdit ? "Edit Syllabus Topic" : "Add New Syllabus Topic"}
      subtitle="Dynamic Topic Configuration (Shared Across Both Dashboards)"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Topic Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Graph Cycle Detection & Disjoint Set Union"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Description &amp; Key Concepts
          </label>
          <textarea
            rows={2}
            placeholder="Core focus areas, algorithms to implement, or interview questions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-3 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Grid selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Subject */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
            >
              {db.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Subtopics */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-300 block">
            Subtopics &amp; Focus Checkpoints
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Tarjan's algorithm or Memory alignment"
              value={newSubtopic}
              onChange={(e) => setNewSubtopic(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
            />
            <button
              type="button"
              onClick={handleAddSubtopic}
              className="px-3 py-1.5 rounded-lg bg-[#1F2839] hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08]"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {subtopics.map((st, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-md bg-[#141A26] border border-white/[0.06] text-slate-200 flex items-center gap-1.5"
              >
                <span>{st}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtopic(i)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
          {topicToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs border border-rose-900/40 font-medium"
            >
              Delete Topic
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 text-xs font-medium hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs"
            >
              {topicToEdit ? "Save Changes" : "Create Topic"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
