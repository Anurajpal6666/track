"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store/useStore";
import { CodingProblem, Difficulty, CodingLanguage, ProblemStatus } from "@/lib/types";
import { Code2, Save, Trash2, ExternalLink } from "lucide-react";

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemToEdit?: CodingProblem | null;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  isOpen,
  onClose,
  problemToEdit,
}) => {
  const { addCodingProblem, updateCodingProblem, deleteCodingProblem } = useStore();

  const [problemName, setProblemName] = useState("");
  const [problemUrl, setProblemUrl] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [topicTag, setTopicTag] = useState("Dynamic Programming");
  const [language, setLanguage] = useState<CodingLanguage>("C++");
  const [dateSolved, setDateSolved] = useState(new Date().toISOString().split("T")[0]);
  const [solutionApproach, setSolutionApproach] = useState("");
  const [timeComplexity, setTimeComplexity] = useState("O(N)");
  const [spaceComplexity, setSpaceComplexity] = useState("O(1)");
  const [personalNotes, setPersonalNotes] = useState("");
  const [status, setStatus] = useState<ProblemStatus>("SOLVED");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [needsRevision, setNeedsRevision] = useState(false);

  useEffect(() => {
    if (problemToEdit) {
      setProblemName(problemToEdit.problemName);
      setProblemUrl(problemToEdit.problemUrl);
      setDifficulty(problemToEdit.difficulty);
      setTopicTag(problemToEdit.topicTag);
      setLanguage(problemToEdit.language);
      setDateSolved(problemToEdit.dateSolved);
      setSolutionApproach(problemToEdit.solutionApproach);
      setTimeComplexity(problemToEdit.timeComplexity);
      setSpaceComplexity(problemToEdit.spaceComplexity);
      setPersonalNotes(problemToEdit.personalNotes);
      setStatus(problemToEdit.status);
      setCodeSnippet(problemToEdit.codeSnippet || "");
      setNeedsRevision(problemToEdit.needsRevision);
    } else {
      setProblemName("");
      setProblemUrl("");
      setDifficulty("MEDIUM");
      setTopicTag("Arrays & Two Pointers");
      setLanguage("C++");
      setDateSolved(new Date().toISOString().split("T")[0]);
      setSolutionApproach("");
      setTimeComplexity("O(N)");
      setSpaceComplexity("O(1)");
      setPersonalNotes("");
      setStatus("SOLVED");
      setCodeSnippet("");
      setNeedsRevision(false);
    }
  }, [problemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemName.trim()) return;

    if (problemToEdit) {
      updateCodingProblem(problemToEdit.id, {
        problemName,
        problemUrl,
        difficulty,
        topicTag,
        language,
        dateSolved,
        solutionApproach,
        timeComplexity,
        spaceComplexity,
        personalNotes,
        status,
        codeSnippet,
        needsRevision,
      });
    } else {
      addCodingProblem({
        problemName,
        problemUrl: problemUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problemName)}`,
        difficulty,
        topicTag,
        language,
        dateSolved,
        solutionApproach,
        timeComplexity,
        spaceComplexity,
        personalNotes,
        status,
        codeSnippet,
        needsRevision,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (problemToEdit && window.confirm("Are you sure you want to delete this problem record?")) {
      deleteCodingProblem(problemToEdit.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={problemToEdit ? "Edit LeetCode Problem Record" : "Log Solved Coding Problem"}
      subtitle="Record complexities, approach, and code implementation notes"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              Problem Name
            </label>
            <input
              type="text"
              value={problemName}
              onChange={(e) => setProblemName(e.target.value)}
              placeholder="e.g. Trapping Rain Water"
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              LeetCode / Platform URL
            </label>
            <input
              type="url"
              value={problemUrl}
              onChange={(e) => setProblemUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodingLanguage)}
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
            >
              <option value="C++">C++</option>
              <option value="C">C</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              Topic Tag
            </label>
            <input
              type="text"
              value={topicTag}
              onChange={(e) => setTopicTag(e.target.value)}
              placeholder="e.g. Graphs / DP"
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              Date Solved
            </label>
            <input
              type="date"
              value={dateSolved}
              onChange={(e) => setDateSolved(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              Time Complexity
            </label>
            <input
              type="text"
              value={timeComplexity}
              onChange={(e) => setTimeComplexity(e.target.value)}
              placeholder="e.g. O(N log N)"
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
              Space Complexity
            </label>
            <input
              type="text"
              value={spaceComplexity}
              onChange={(e) => setSpaceComplexity(e.target.value)}
              placeholder="e.g. O(1) auxiliary"
              className="w-full text-xs px-3 py-2 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
            Solution Strategy & Key Intuition
          </label>
          <textarea
            value={solutionApproach}
            onChange={(e) => setSolutionApproach(e.target.value)}
            placeholder="Explain the pattern used (e.g. Two Pointers, Monotonic Stack, BFS Queue) and tricky edge conditions..."
            rows={2}
            className="w-full text-xs p-3 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
            Code Implementation Snippet (Optional)
          </label>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Paste clean reference solution..."
            rows={4}
            className="w-full text-xs p-3 bg-sap-graphite border border-sap-border rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sap-gold"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="needsRev"
            checked={needsRevision}
            onChange={(e) => setNeedsRevision(e.target.checked)}
            className="rounded bg-sap-graphite border-sap-border text-sap-gold focus:ring-sap-gold"
          />
          <label htmlFor="needsRev" className="text-xs font-medium text-slate-300">
            Flag this problem for spaced repetition revision
          </label>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-sap-border">
          {problemToEdit ? (
            <Button type="button" variant="danger" size="sm" onClick={handleDelete} icon={<Trash2 className="w-3.5 h-3.5" />}>
              Delete Record
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
              Save Problem Record
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
