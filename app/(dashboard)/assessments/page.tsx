"use client";

import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type AssessmentItem = {
  id: string;
  title: string;
  jobTitle: string;
  department: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  questionsCount: number;
  interviewsCount: number;
  createdAt: string;
};

const mockAssessments: AssessmentItem[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer Assessment",
    jobTitle: "Senior Frontend Engineer",
    department: "Engineering",
    status: "ACTIVE",
    questionsCount: 8,
    interviewsCount: 5,
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    title: "Product Manager Interview Guide",
    jobTitle: "Product Manager",
    department: "Product",
    status: "DRAFT",
    questionsCount: 6,
    interviewsCount: 0,
    createdAt: "2025-01-20",
  },
  {
    id: "3",
    title: "Data Scientist Evaluation",
    jobTitle: "Data Scientist",
    department: "Data",
    status: "ACTIVE",
    questionsCount: 10,
    interviewsCount: 7,
    createdAt: "2025-01-10",
  },
  {
    id: "4",
    title: "UX Designer Assessment",
    jobTitle: "UX Designer",
    department: "Design",
    status: "ARCHIVED",
    questionsCount: 7,
    interviewsCount: 12,
    createdAt: "2024-12-01",
  },
];

const statusColors = {
  DRAFT: "warning" as const,
  ACTIVE: "success" as const,
  ARCHIVED: "secondary" as const,
};

export default function AssessmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = mockAssessments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Manage your structured interview assessments.
          </p>
        </div>
        <Link href="/assessments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "ACTIVE", "DRAFT", "ARCHIVED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{assessment.title}</CardTitle>
                <Badge variant={statusColors[assessment.status]}>
                  {assessment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Job Title</span>
                  <span className="font-medium text-foreground">{assessment.jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Department</span>
                  <span className="font-medium text-foreground">{assessment.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions</span>
                  <span className="font-medium text-foreground">{assessment.questionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interviews</span>
                  <span className="font-medium text-foreground">{assessment.interviewsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No assessments found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
