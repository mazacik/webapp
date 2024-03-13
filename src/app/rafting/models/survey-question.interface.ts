import { SurveyChoice } from "./survey-choice.interface";

export interface SurveyQuestion {
  id: string;
  title: string;
  description: string;
  type: 'checkbox' | 'radio' | 'text',
  dontcare: boolean;
  options?: SurveyChoice[];
}