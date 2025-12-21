import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import i18next from "i18next";
import { DISTRACTOR_CONFIG, TIMING_CONFIG } from "../../../config/constants";
import { Phase, TaskName } from "../../../types/enums";

export function createDistractorTimeline(updateSession: any, startIdx: number) {
  const trials = Array.from({ length: DISTRACTOR_CONFIG.TRIAL_COUNT }, () => {
    const { MIN, MAX } = DISTRACTOR_CONFIG.NUMBER_RANGE;
    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const isEven = randomNumber % 2 === 0;

    return {
      number: randomNumber,
      correct_response: isEven
        ? DISTRACTOR_CONFIG.KEYS[0]
        : DISTRACTOR_CONFIG.KEYS[1],
    };
  });

  return trials.flatMap((item, i) => {
    const fixationIdx = startIdx + i * 2;
    const taskIdx = startIdx + i * 2 + 1;

    return [
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: '<div class="fixation-cross">+</div>',
        choices: "NO_KEYS",
        trial_duration: TIMING_CONFIG.FIXATION_DURATION_MS,
        on_finish: (d: any) => {
          d.phase = Phase.DISTRACTOR;
          updateSession(fixationIdx, d);
        },
      },
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: `
          <div class="distractor-task">
            <div class="number-display">${item.number}</div>
            <div class="key-hints">
              <p><strong>${DISTRACTOR_CONFIG.KEYS[0].toUpperCase()}</strong>: ${i18next.t(
          "distractor.even"
        )}</p>
              <p><strong>${DISTRACTOR_CONFIG.KEYS[1].toUpperCase()}</strong>: ${i18next.t(
          "distractor.odd"
        )}</p>
            </div>
          </div>
        `,
        choices: DISTRACTOR_CONFIG.KEYS,
        data: {
          task: TaskName.DISTRACTOR,
          phase: Phase.DISTRACTOR,
          correct_response: item.correct_response,
          number: item.number,
        },
        on_finish: (data: any) => {
          data.correct = data.response === data.correct_response;
          updateSession(taskIdx, data);
        },
      },
    ];
  });
}
