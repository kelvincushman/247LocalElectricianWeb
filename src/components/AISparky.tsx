import { useState } from "react";
import { Zap, MessageCircle, Phone, ArrowRight, Bot, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; followUp?: string }[];
}

const questions: Question[] = [
  {
    id: "issue_type",
    question: "What type of electrical issue are you experiencing?",
    options: [
      { value: "power_loss", label: "Complete or partial power loss", followUp: "urgent" },
      { value: "tripping", label: "Circuits keep tripping", followUp: "common" },
      { value: "sparks_smell", label: "Sparks, burning smell, or smoke", followUp: "emergency" },
      { value: "flickering", label: "Flickering lights", followUp: "common" },
      { value: "socket_issue", label: "Socket not working", followUp: "common" },
      { value: "other", label: "Something else", followUp: "describe" },
    ],
  },
  {
    id: "urgency",
    question: "How urgent is this issue?",
    options: [
      { value: "emergency", label: "Emergency - I need help now (24/7)" },
      { value: "today", label: "Today if possible" },
      { value: "this_week", label: "Within the next few days" },
      { value: "quote", label: "Just looking for a quote" },
    ],
  },
];

const diagnoses: Record<string, { title: string; advice: string; urgency: "emergency" | "urgent" | "standard" }> = {
  sparks_smell: {
    title: "Potential Fire Hazard Detected",
    advice: "If you see sparks, smell burning, or see smoke, turn off your main switch immediately and call us. Do not use any electrical appliances until inspected.",
    urgency: "emergency",
  },
  power_loss: {
    title: "Power Loss Assessment",
    advice: "Check if your neighbours have power. If it's just your property, check your consumer unit for tripped switches. If multiple circuits are affected or you can't restore power, we can help diagnose and fix the issue.",
    urgency: "urgent",
  },
  tripping: {
    title: "Circuit Tripping Issue",
    advice: "Frequent tripping usually indicates an overload, faulty appliance, or wiring issue. Try unplugging appliances one by one to identify the culprit. If the problem persists, professional fault-finding is recommended.",
    urgency: "standard",
  },
  flickering: {
    title: "Flickering Lights Assessment",
    advice: "Flickering can be caused by loose connections, faulty switches, or voltage issues. If it affects multiple lights or rooms, it could indicate a more serious wiring problem that needs professional inspection.",
    urgency: "standard",
  },
  socket_issue: {
    title: "Socket Fault",
    advice: "A dead socket could be due to a tripped circuit, loose wiring, or a faulty socket. Check your consumer unit first. If the breaker hasn't tripped, the socket may need replacing or there could be a wiring fault.",
    urgency: "standard",
  },
  other: {
    title: "Electrical Issue Assessment",
    advice: "Based on your description, we recommend a professional inspection to properly diagnose the issue. Our qualified electricians can identify problems quickly and provide a fixed-price solution.",
    urgency: "standard",
  },
};

const AISparky = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setDescription("");
    setShowResult(false);
  };

  const getDiagnosis = () => {
    const issueType = answers.issue_type || "other";
    return diagnoses[issueType] || diagnoses.other;
  };

  const diagnosis = getDiagnosis();
  const currentQuestion = questions[step];

  if (showResult) {
    return (
      <Card className="border-2 border-primary bg-gradient-to-br from-background to-muted">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className={`h-8 w-8 ${diagnosis.urgency === "emergency" ? "text-emergency" : "text-primary"}`} />
          </div>
          <CardTitle className={`text-2xl ${diagnosis.urgency === "emergency" ? "text-emergency" : "text-primary"}`}>
            {diagnosis.title}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            AI Sparky's Assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-foreground">{diagnosis.advice}</p>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-center text-foreground">Ready to get help? Choose how to connect:</p>

            <div className="grid gap-3">
              {diagnosis.urgency === "emergency" && (
                <a href="tel:01onal234567890" className="block">
                  <Button size="lg" className="w-full bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold text-lg py-6">
                    <Phone className="mr-2 h-5 w-5" />
                    EMERGENCY CALL - 24/7
                  </Button>
                </a>
              )}

              <a href="https://wa.me/441234567890?text=Hi%2C%20I%20used%20AI%20Sparky%20and%20need%20help%20with%20an%20electrical%20issue" target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" variant="outline" className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold text-lg py-6">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </Button>
              </a>

              <a href="tel:01234567890" className="block">
                <Button size="lg" variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-lg py-6">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us
                </Button>
              </a>
            </div>
          </div>

          <Button variant="ghost" onClick={handleReset} className="w-full">
            Start New Diagnosis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary bg-gradient-to-br from-background to-muted">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
          <Zap className="h-6 w-6" />
          AI Sparky
        </CardTitle>
        <CardDescription className="text-base">
          Free Electrical Diagnosis Tool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2 mb-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-12 rounded-full ${
                index <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg text-foreground">{currentQuestion.question}</h3>

          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {answers[currentQuestion.id] === "other" && currentQuestion.id === "issue_type" && (
            <Textarea
              placeholder="Please describe your electrical issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-4"
            />
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
          className="w-full bg-primary hover:bg-primary/90 font-bold"
          size="lg"
        >
          {step < questions.length - 1 ? "Next" : "Get Diagnosis"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AISparky;
