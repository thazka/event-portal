export interface Option {
    label: string;
    value: string;
}

export interface Field {
    label: string;
    type: string;
    options: Option[];
    selectedAnswers: string[];
    isEditing: boolean;
    newOption: string;
}