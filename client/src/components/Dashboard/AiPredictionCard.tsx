
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiAlertCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";

interface Prediction {
  title: string;
  description: string;
  severity: "alert" | "warning" | "info";
}

interface AiPredictionCardProps {
  predictions: Prediction[];
}

export const AiPredictionCard = ({ predictions }: AiPredictionCardProps) => {
  // Function to get the right icon based on severity
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "alert":
        return <FiAlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <FiAlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <FiInfo className="h-5 w-5 text-blue-500" />;
      default:
        return <FiInfo className="h-5 w-5 text-blue-500" />;
    }
  };

  // Function to get the right color class based on severity
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "alert":
        return "bg-red-50 border-red-100";
      case "warning":
        return "bg-amber-50 border-amber-100";
      case "info":
        return "bg-blue-50 border-blue-100";
      default:
        return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          AI Predictions & Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {predictions.length > 0 ? (
          predictions.map((prediction, index) => (
            <div
              key={index}
              className={`flex items-start p-3 rounded-md border ${getSeverityClass(
                prediction.severity
              )}`}
            >
              <div className="mr-3 mt-0.5">
                {getSeverityIcon(prediction.severity)}
              </div>
              <div>
                <h4 className="text-sm font-medium">{prediction.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {prediction.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No predictions available at this time
          </div>
        )}
      </CardContent>
    </Card>
  );
};
