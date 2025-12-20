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
  startIdx: number
) {
  const lang = (i18next.language.split("-")[0] as Language) || Language.TR;
  const content = (DEMOGRAPHICS_DATA as any)[lang];
  const isHeritage = group === ParticipantGroup.HERITAGE;

  const survey_json: any = {
    showQuestionNumbers: "off",
    // requiredText: i18next.t("demographics.validation.required"), // localizable değil
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
          },
          {
            type: "radiogroup",
            name: "gender",
            title: content.questions.gender.title,
            choices: content.questions.gender.options,
            showOtherItem: true,
            // ✅ "Other" metinleri key'den geliyor
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
          // ✅ İndeks bazlı kontrol: "Hayır" veya "Nein" seçilirse görünür
          visibleIf: `{born_germany} == '${
            (lang === Language.TR ? ["Evet", "Hayır"] : ["Ja", "Nein"])[1]
          }'`,
          inputType: "number",
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
      // 🛡️ Eklentinin applyStyles baskısını (satır 166) kırmak için 0ms timeout
      setTimeout(() => {
        const isDarkMode = document.body.classList.contains("dark-mode");
        survey.applyTheme(isDarkMode ? DefaultDark : DefaultLight);
      }, 0);

      // 🌙 Canlı Tema Değişim Dinleyicisi
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
      jsPsych.data.addProperties(data.response);
      updateSession(startIdx, data.response);
    },
  };
}
