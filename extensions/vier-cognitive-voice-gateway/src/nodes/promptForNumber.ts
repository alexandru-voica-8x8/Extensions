import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import {
  convertDuration,
  DEFAULT_NUMBER_VALUE,
  normalizeInteger,
  normalizeTextArray,
} from "../helpers/util";
import {
  bargeInFields,
  bargeInForm,
  BargeInInputs,
  bargeInSection,
  convertBargeIn,
} from "../common/bargeIn";
import { promptFields } from "../common/prompt";

interface INumberPromptNodeInputs extends BargeInInputs {
  text: string,
  timeout: number,
  language?: string,
  synthesizers?: Array<string>,
  submitInputs?: Array<string>,
  minDigits?: number,
  maxDigits?: number,
}

export interface INumberPromptNodeParams extends INodeFunctionBaseParams {
  config: INumberPromptNodeInputs;
}

export const promptForNumberNode = createNodeDescriptor({
  type: 'numberPrompt',
  defaultLabel: t.promptForNumber.nodeLabel,
  summary: t.promptForNumber.nodeSummary,
  appearance: {
    color: '#38eb8c',
  },
  tags: ['message'],
  fields: [
    ...promptFields,
    ...bargeInFields,
    {
      type: 'textArray',
      key: 'submitInputs',
      label: t.promptForNumber.inputSubmitInputsLabel,
      description: t.promptForNumber.inputSubmitInputsDescription,
    },
    {
      type: 'number',
      key: 'minDigits',
      label: t.promptForNumber.inputMinDigitsLabel,
      description: t.promptForNumber.inputMinDigitsDescription,
      defaultValue: DEFAULT_NUMBER_VALUE,
      params: {
        min: 1,
      },
    },
    {
      type: 'number',
      key: 'maxDigits',
      label: t.promptForNumber.inputMaxDigitsLabel,
      description: t.promptForNumber.inputMaxDigitsDescription,
      defaultValue: DEFAULT_NUMBER_VALUE,
      params: {
        min: 1,
      },
    },
  ],
  sections: [
    {
      key: 'general',
      fields: ['text', 'timeout'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
    {
      key: 'stopCondition',
      fields: ['submitInputs', 'minDigits', 'maxDigits'],
      label: t.shared.sectionStopConditionLabel,
      defaultCollapsed: false,
    },
    bargeInSection,
    {
      key: 'additional',
      fields: ['language', 'synthesizers'],
      label: t.forward.sectionAdditionalSettingsLabel,
      defaultCollapsed: true,
    },
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
    {
      key: 'stopCondition',
      type: 'section',
    },
    bargeInForm,
    {
      key: 'additional',
      type: 'section',
    },
  ],
  preview: {
    key: 'text',
    type: 'text',
  },
  function: async ({ cognigy, config }: INumberPromptNodeParams) => {
    const { api } = cognigy;
    let submitInputs = normalizeTextArray(config.submitInputs);

    if (submitInputs) {
      submitInputs = submitInputs.map(input => {
        if (input.match(/^[1234567890ABCD*#]$/i)) {
          return `DTMF_${input.toUpperCase()}`;
        }
        return input;
      });
    }

    const payload = {
      status: 'prompt',
      timeout: convertDuration(config.timeout),
      language: config.language ? config.language : undefined,
      synthesizers: normalizeTextArray(config.synthesizers),
      bargeIn: convertBargeIn(api, config),
      type: {
        name: 'Number',
        submitInputs: submitInputs,
        minDigits: normalizeInteger(config.minDigits, undefined, undefined),
        maxDigits: normalizeInteger(config.maxDigits, undefined, undefined),
      },
    };
    api.say(config.text, payload);
  },
});
