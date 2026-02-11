"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddQuestionDialog } from "@/components/forms/add-question-dialog";
import { AddCompetencyDialog } from "@/components/forms/add-competency-dialog";

type Assessment = {
  id: string;
  title: string;
  description: string | null;
  jobTitle: string;
  jobDescription: string;
  department: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: string;
  competencies: {
    id: string;
    name: string;
    description: string | null;
    questions: {
      id: string;
      content: string;
      type: string;
      order: number;
      rubricLevels: {
        id: string;
        level: number;
        label: string;
        description: string;
      }[];
    }[];
  }[];
  _count: {
    questions: number;
    interviews: number;
  };
};

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddCompetency, setShowAddCompetency] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchAssessment();
    }
  }, [resolvedParams]);

  const fetchAssessment = async () => {
    if (!resolvedParams) return;
    
    try {
      const response = await fetch(`/api/assessments/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
      } else {
        alert("Assessment not found");
        router.push("/assessments");
      }
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!resolvedParams || !assessment) return;
    
    if (!confirm("Are you sure you want to publish this assessment?")) return;

    try {
      const response = await fetch(`/api/assessments/${resolvedParams.id}/publish`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Assessment published successfully!");
        fetchAssessment();
      } else {
        const error = await response.json();
        alert(error.details?.join("\n") || error.error || "Failed to publish assessment");
      }
    } catch (error) {
      console.error("Error publishing assessment:", error);
      alert("Failed to publish assessment");
    }
  };

  const handleAddCompetency = () => {
    setShowAddCompetency(true);
  };

  const handleAddQuestion = (competencyId: string) => {
    setSelectedCompetency(competencyId);
    setShowAddQuestion(true);
  };

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading assessment...</p>
      </div>
    );
  }

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

  const canPublish = assessment.competencies.length > 0 && 
                     assessment.competencies.some(c => c.questions.length > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/assessments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{assessment.title}</h1>
            <Badge className={getStatusColor(assessment.status)}>{assessment.status}</Badge>
          </div>
          <p className="text-muted-foreground">{assessment.jobTitle}</p>
        </div>
        {assessment.status === "DRAFT" && (
          <Button onClick={handlePublish} disabled={!canPublish}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Publish Assessment
          </Button>
        )}
      </div>

      {/* Assessment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Job Title</p>
              <p className="font-medium">{assessment.jobTitle}</p>
            </div>
            {assessment.department && (
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{assessment.department}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Competencies</p>
              <p className="font-medium">{assessment.competencies.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Questions</p>
              <p className="font-medium">{assessment._count.questions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Interviews</p>
              <p className="font-medium">{assessment._count.interviews}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(assessment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {assessment.description && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground text-sm mb-1">Description</p>
                <p className="text-sm">{assessment.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Competencies & Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Competencies & Questions</CardTitle>
              <CardDescription>
                Define questions for each competency with behavioral rubrics
              </CardDescription>
            </div>
            <Button onClick={handleAddCompetency} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Competency
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment.competencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No competencies yet. Add your first competency to get started.</p>
            </div>
          ) : (
            assessment.competencies.map((competency) => (
              <div key={competency.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{competency.name}</h3>
                    {competency.description && (
                      <p className="text-sm text-muted-foreground mt-1">{competency.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAddQuestion(competency.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>

                {competency.questions.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {competency.questions.map((question, index) => (
                      <div key={question.id} className="bg-muted/30 rounded p-3 space-y-2">
                        <div className="flex items-start gap-3">
                          <span className="font-medium text-sm text-muted-foreground">
                            Q{index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm">{question.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {question.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {question.rubricLevels.length} rubric levels
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No questions yet for this competency.
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showAddCompetency && resolvedParams && (
        <AddCompetencyDialog
          assessmentId={resolvedParams.id}
          open={showAddCompetency}
          onClose={() => setShowAddCompetency(false)}
          onSuccess={fetchAssessment}
        />
      )}
      
      {showAddQuestion && selectedCompetency && resolvedParams && (
        <AddQuestionDialog
          assessmentId={resolvedParams.id}
          competencyId={selectedCompetency}
          open={showAddQuestion}
          onClose={() => {
            setShowAddQuestion(false);
            setSelectedCompetency(null);
          }}
          onSuccess={fetchAssessment}
        />
      )}
    </div>
  );
}
