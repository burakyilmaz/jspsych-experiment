import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

export function createInvalidPathTimeline() {
  return {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <div class="error-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          The link you followed is invalid or has expired. <br>
          Please check the URL and try again.
        </p>
      </div>
    `,
    choices: "NO_KEYS",
  };
}
