import jsPsychSurvey from "@jspsych/plugin-survey";
import i18next from "i18next";
import { ParticipantGroup, Language } from "../../../types/enums";
import { DEMOGRAPHICS_DATA } from "../../../data/demographics_data";
import { Model } from "survey-core";
import { DefaultLight, DefaultDark } from "survey-core/themes";

export function createDemographicsTimeline(
  jsPsych: any,
  group: ParticipantGroup,
  updateSession: any,
  startIdx: number,
  expType: string,
  subject_id: string
) {
  const lang = (i18next.language.split("-")[0] as Language) || Language.TR;
  const content = (DEMOGRAPHICS_DATA as any)[lang];
  const isHeritage = group === ParticipantGroup.HERITAGE;

  const DATA_KEY = `survey_data_${expType}_${subject_id}`;
  const STATE_KEY = `survey_state_${expType}_${subject_id}`;

  const survey_json: any = {
    showQuestionNumbers: "off",
    pageNextText: i18next.t("buttons.next"),
    pagePrevText: i18next.t("buttons.previous"),
    completeText: i18next.t("buttons.confirm"),

    pages: [
      {
        name: "consent_page",
        elements: [
          {
            type: "html",
            name: "consent_text",
            html: `<div class="consent-text-wrapper">${content.consent[group]}</div>`,
          },
          {
            type: "checkbox",
            name: "consent_agreement",
            title: content.consent.checkbox,
            isRequired: true,
            choices: [{ value: "agreed", text: i18next.t("buttons.confirm") }],
          },
        ],
      },
      {
        name: "basic_demographics",
        elements: [
          {
            type: "text",
            name: "age",
            title: content.questions.age,
            inputType: "number",
            isRequired: true,
            validators: [
              {
                type: "numeric",
                minValue: 18,
                maxValue: 120,
                text: i18next.t("demographics.validation.age_range"),
              },
            ],
          },
          {
            type: "radiogroup",
            name: "gender",
            title: content.questions.gender.title,
            choices: content.questions.gender.options,
            showOtherItem: true,
            otherText: i18next.t("demographics.questions.other_text"),
            otherPlaceholder: i18next.t(
              "demographics.questions.other_placeholder"
            ),
            isRequired: true,
          },
          {
            type: "radiogroup",
            name: "education",
            title: content.questions.education.title,
            choices: content.questions.education.options,
            showOtherItem: true,
            otherText: i18next.t("demographics.questions.other_text"),
            isRequired: true,
          },
          {
            type: "text",
            name: "department",
            title: content.questions.department,
            isRequired: true,
          },
        ],
      },
      {
        name: "language_info",
        elements: [
          {
            type: "text",
            name: "mother_tongue",
            title: content.questions.mother_tongue,
            isRequired: true,
          },
          {
            type: "text",
            name: "other_languages",
            title: content.questions.other_languages,
          },
        ],
      },
    ],
  };

  if (isHeritage && content.heritage_specific) {
    const h = content.heritage_specific;
    survey_json.pages.push({
      name: "heritage_section",
      elements: [
        {
          type: "radiogroup",
          name: "born_germany",
          title: h.born_germany,
          choices: lang === Language.TR ? ["Evet", "Hayır"] : ["Ja", "Nein"],
          isRequired: true,
        },
        {
          type: "text",
          name: "move_year",
          title: h.move_year,
          visibleIf: `{born_germany} == '${
            (lang === Language.TR ? ["Evet", "Hayır"] : ["Ja", "Nein"])[1]
          }'`,
          inputType: "number",
          validators: [
            {
              type: "numeric",
              minValue: 1900,
              maxValue: new Date().getFullYear(),
              text: i18next.t("demographics.validation.invalid_year"),
            },
          ],
        },
        {
          type: "text",
          name: "parents_lang",
          title: h.parents_lang,
          isRequired: true,
        },
        {
          type: "matrix",
          name: "helex_proficiency",
          title: h.helex_proficiency_title,
          columns: h.helex_options,
          rows: h.helex_questions.map((q: string, i: number) => ({
            value: `prof_${i}`,
            text: q,
          })),
          isRequired: true,
        },
        {
          type: "matrix",
          name: "helex_frequency",
          title: h.frequency_title,
          columns: h.frequency_options,
          rows: h.frequency_questions.map((q: string, i: number) => ({
            value: `freq_${i}`,
            text: q,
          })),
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "identity",
          title: h.identity_statement,
          choices: h.identity_options,
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "visit_count",
          title: h.visit_count_title,
          choices: h.visit_count_options,
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "visit_duration",
          title: h.visit_duration_title,
          choices: h.visit_duration_options,
          isRequired: true,
        },
      ],
    });
  }

  return {
    type: jsPsychSurvey,
    survey_json: survey_json,
    survey_function: (survey: Model) => {
      const prevData = localStorage.getItem(DATA_KEY);
      if (prevData) {
        survey.data = JSON.parse(prevData);
      }

      const prevState = localStorage.getItem(STATE_KEY);
      if (prevState) {
        const state = JSON.parse(prevState);
        if (state.currentPageNo !== undefined) {
          survey.currentPageNo = state.currentPageNo;
        }
      }

      survey.onValueChanged.add((sender) => {
        localStorage.setItem(DATA_KEY, JSON.stringify(sender.data));
      });

      survey.onCurrentPageChanged.add((sender) => {
        localStorage.setItem(
          STATE_KEY,
          JSON.stringify({ currentPageNo: sender.currentPageNo })
        );
      });

      setTimeout(() => {
        const isDarkMode = document.body.classList.contains("dark-mode");
        survey.applyTheme(isDarkMode ? DefaultDark : DefaultLight);
      }, 0);

      const themeBtn = document.getElementById("theme-toggle-btn");
      if (themeBtn) {
        themeBtn.addEventListener("click", () => {
          setTimeout(() => {
            const isDarkMode = document.body.classList.contains("dark-mode");
            survey.applyTheme(isDarkMode ? DefaultDark : DefaultLight);
          }, 50);
        });
      }
    },
    on_finish: (data: any) => {
      localStorage.removeItem(DATA_KEY);
      localStorage.removeItem(STATE_KEY);

      jsPsych.data.addProperties(data.response);
      updateSession(startIdx, data.response);
    },
  };
}
