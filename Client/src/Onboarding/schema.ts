import { z } from "zod";

export const jurisdictionSchema = z.object({
  jurisdiction: z.string().min(1, "Please select a jurisdiction"),
});

export const investorTypeSchema = z.object({
  investorType: z.enum(["individual", "entity"], {
    required_error: "Please select investor type",
  }),
});

export const individualInvestorTypeSchema = z.object({
  individualInvestorType: z.enum(
    ["high_net_worth", "self_certified_sophisticated_investor"],
    {
      required_error: "Please select individual investor type",
    }
  ),
});

export const highNetWorthSchema = z.object({
  highNetWorthQualification: z.object({
    incomeQualified: z.string({
      required_error: "Please select whether you meet the income qualification",
      invalid_type_error: "Please select Yes or No",
    }),
    incomeAmount: z
      .number({
        required_error: "Please specify your income amount",
        invalid_type_error: "Please enter a valid number",
      })
      .min(100000, "Income must be at least £100,000")
      .optional()
      .nullable(),
    netAssetsQualified: z.string({
      required_error:
        "Please select whether you meet the net assets qualification",
      invalid_type_error: "Please select Yes or No",
    }),
    netAssetsAmount: z
      .number({
        required_error: "Please specify your net assets amount",
        invalid_type_error: "Please enter a valid number",
      })
      .min(250000, "Net assets must be at least £250,000")
      .optional()
      .nullable(),
    noneApply: z.boolean(),
    declarationAccepted: z
      .boolean({
        required_error: "You must accept the declaration to proceed",
      })
      .refine(
        (val) => val === true,
        "You must accept the declaration to proceed"
      ),
  }),
  signature: z
    .string({
      required_error: "Signature is required",
    })
    .min(1, "Please provide your signature"),
  signatureDate: z
    .string({
      required_error: "Date is required",
    })
    .min(1, "Please provide the date"),
});

export const selfCertifiedSophisticatedSchema = z.object({
  selfCertifiedSophisticatedInvestor: z.object({
    // (A) Professional Capacity
    professionalCapacity: z.string({
      required_error: "Please select Yes or No for question A",
      invalid_type_error: "Please select Yes or No",
    }),
    professionalCapacityDetails: z
      .string()
      .min(1, "Please provide the name of the business/organization")
      .optional()
      .or(z.literal("")),

    // (B) Director
    director: z.string({
      required_error: "Please select Yes or No for question B",
      invalid_type_error: "Please select Yes or No",
    }),
    directorDetails: z
      .object({
        companyName: z
          .string()
          .min(1, "Please provide company name")
          .optional(),
        companyNumber: z
          .string()
          .min(1, "Please provide company number")
          .optional(),
      })
      .optional(),

    // (C) Unlisted Investments
    unlistedInvestments: z.string({
      required_error: "Please select Yes or No for question C",
      invalid_type_error: "Please select Yes or No",
    }),
    unlistedInvestmentsCount: z
      .number({
        required_error: "Please provide the number of investments",
        invalid_type_error: "Please enter a valid number",
      })
      .min(2, "Must be at least 2 investments")
      .optional()
      .or(z.literal("")),

    // (D) Business Angel
    businessAngel: z.string({
      required_error: "Please select Yes or No for question D",
      invalid_type_error: "Please select Yes or No",
    }),
    businessAngelNetwork: z
      .string()
      .min(1, "Please provide the name of the network or syndicate")
      .optional()
      .or(z.literal("")),

    // (E) None Apply
    noneApply: z.boolean(),

    // Declaration
    declarationAccepted: z
      .boolean({
        required_error: "You must accept the declaration to proceed",
      })
      .refine(
        (val) => val === true,
        "You must accept the declaration to proceed"
      ),
  }),
  signature: z
    .string({
      required_error: "Signature is required",
    })
    .min(1, "Please provide your signature"),
  signatureDate: z
    .string({
      required_error: "Date is required",
    })
    .min(1, "Please provide the date"),
});
export const entityDetailsSchema = z
  .object({
    entityType: z.enum(
      ["investment_professional", "high_net_worth_company", "other"],
      {
        required_error: "Please select an entity type",
      }
    ),
    entityName: z.string().min(1, "Entity name is required"),
    referenceNumber: z.string().optional().nullable(),
    highNetWorthCompanySubType: z
      .enum(["a", "b", "c", "d", "e"], {
        required_error: "Please select a company type",
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.entityType === "high_net_worth_company") {
        return (
          data.highNetWorthCompanySubType !== undefined &&
          data.highNetWorthCompanySubType !== null
        );
      }
      return true;
    },
    {
      message: "Please select a company type",
      path: ["highNetWorthCompanySubType"], // This will show error on the specific field
    }
  );
