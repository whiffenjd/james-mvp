import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { InvestorOnboardingPayload } from '../Onboarding/types';


interface OnboardingState {
    currentStep: number;
    formData: InvestorOnboardingPayload;
    isLoading: boolean;
    errors: any;
}

type OnboardingAction =
    | { type: 'SET_STEP'; payload: number }
    | { type: 'UPDATE_FORM_DATA'; payload: Partial<InvestorOnboardingPayload> }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERRORS'; payload: any }
    | { type: 'RESET_FORM' };

const initialState: OnboardingState = {
    currentStep: 1,
    formData: {},
    isLoading: false,
    errors: null
};

// First, add a helper function to clean unnecessary data
const cleanFormData = (data: Partial<InvestorOnboardingPayload>): Partial<InvestorOnboardingPayload> => {
    const cleaned = { ...data };

    // Clean based on investor type
    if (cleaned.investorType === 'individual') {
        // Remove entity-related data
        delete cleaned.entityDetails;
        delete cleaned.entityClassification;
        delete cleaned.entityDocuments;

        // Clean based on individual investor type
        if (cleaned.individualInvestorType === 'high_net_worth') {
            delete cleaned.selfCertifiedSophisticatedInvestor;
        } else if (cleaned.individualInvestorType === 'self_certified_sophisticated_investor') {
            delete cleaned.highNetWorthQualification;
        }
    } else if (cleaned.investorType === 'entity') {
        // Remove individual-related data
        delete cleaned.individualInvestorType;
        delete cleaned.highNetWorthQualification;
        delete cleaned.selfCertifiedSophisticatedInvestor;
        delete cleaned.kycDocumentUrl;
        delete cleaned.proofOfAddressUrl;
        if (cleaned.entityDetails?.entityType === "investment_professional") {
            delete cleaned.entityDetails.highNetWorthCompanySubType
        }
    }

    return cleaned;
};

// Update the reducer to use the cleaning function
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, currentStep: action.payload };
        case 'UPDATE_FORM_DATA': {
            const newFormData = cleanFormData({
                ...state.formData,
                ...action.payload
            });
            return {
                ...state,
                formData: newFormData
            };
        }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        case 'RESET_FORM':
            return initialState;
        default:
            return state;
    }
}

const OnboardingContext = createContext<{
    state: OnboardingState;
    dispatch: React.Dispatch<OnboardingAction>;
    nextStep: () => void;
    prevStep: () => void;
    updateFormData: (data: Partial<InvestorOnboardingPayload>) => void;
} | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(onboardingReducer, initialState);

    const nextStep = () => {
        dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    };

    const prevStep = () => {
        dispatch({ type: 'SET_STEP', payload: Math.max(1, state.currentStep - 1) });
    };

    const updateFormData = (data: Partial<InvestorOnboardingPayload>) => {
        const cleanedData = cleanFormData({
            ...state.formData,
            ...data
        });
        console.log("Cleaned data:", cleanedData);
        dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
    };

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('investor_onboarding');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                dispatch({ type: 'UPDATE_FORM_DATA', payload: parsed.formData });
                dispatch({ type: 'SET_STEP', payload: parsed.currentStep });
            } catch (error) {
                console.error('Error loading saved onboarding data:', error);
            }
        }
    }, []);

    // Save data to localStorage when state changes
    useEffect(() => {
        localStorage.setItem('investor_onboarding', JSON.stringify({
            formData: state.formData,
            currentStep: state.currentStep
        }));
    }, [state.formData, state.currentStep]);

    return (
        <OnboardingContext.Provider value={{ state, dispatch, nextStep, prevStep, updateFormData }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider');
    }
    return context;
}
