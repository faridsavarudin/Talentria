"use client";

import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type AssessmentItem = {
  id: string;
  title: string;
  jobTitle: string;
  department: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: string;
  _count: {
    questions: number;
    interviews: number;
    competencies: number;
  };
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchAssessments();
  }, [statusFilter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/assessments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAssessments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

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
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="outline" size="sm">
          Search
        </Button>
        <div className="flex gap-2">
          {["", "ACTIVE", "DRAFT", "ARCHIVED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Assessment Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Link key={assessment.id} href={`/assessments/${assessment.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{assessment.title}</CardTitle>
                    <Badge className={getStatusColor(assessment.status)}>
                      {assessment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Job Title</span>
                      <span className="font-medium text-foreground truncate ml-2">{assessment.jobTitle}</span>
                    </div>
                    {assessment.department && (
                      <div className="flex justify-between">
                        <span>Department</span>
                        <span className="font-medium text-foreground truncate ml-2">{assessment.department}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Competencies</span>
                      <span className="font-medium text-foreground">{assessment._count.competencies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions</span>
                      <span className="font-medium text-foreground">{assessment._count.questions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interviews</span>
                      <span className="font-medium text-foreground">{assessment._count.interviews}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t">
                      <span>Created</span>
                      <span className="font-medium text-foreground">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && assessments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No assessments found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter 
              ? "Try adjusting your search or filters." 
              : "Get started by creating your first assessment."}
          </p>
          {!search && !statusFilter && (
            <Link href="/assessments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Assessment
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
