function boilerplate(specName, specUrl) {
  return `**Please check that the \`a11y-tracker\` label has been added to this issue.** Adding the label makes the [Accessible Platform Architectures WG](https://www.w3.org/WAI/about/groups/apawg/) aware of your proposal; this helps them understand upcoming changes to the web platform, and can speed up future horizontal review. If you don't have permission to add labels in this repo, please leave this text here, so a repo admin will know to add the label. If the label has been added, please remove this note.

This is an accessibility screener result for "${specName}" (<${specUrl}>).\n\n`;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("questionnaire");
  const q2Details = document.getElementById("q2_details");
  const q7Details = document.getElementById("q7_details");

  function escapeMarkdown(text) {
    return text
      .replace(/\\/g, "\\\\") // Escape backslash first
      .replace(/([*_`~[\]#>!|])/g, "\\$1") // Escape Markdown symbols
      .replace(/^([-+*])/gm, "\\$1") // Escape list symbols at start of lines
      .replace(/\)/g, "\\)") // Escape closing parenthesis
      .replace(/\(/g, "\\("); // Escape opening parenthesis
  }

  function generateMarkdown(form) {
    let count = 1;
    const specName = document.getElementById("spec-name").value.trim();
    const specUrl = document.getElementById("spec-url").value.trim();
    let markdown = boilerplate(specName, specUrl);
    const fieldsets = form.querySelectorAll("fieldset");

    fieldsets.forEach((fs) => {
      const legend = fs.querySelector("legend");
      if (!legend) return;

    let questionText = legend.textContent.trim().replace(/\n/g, " ");
    questionText = questionText.replace(/\s+/g, " ");
    questionText = questionText.replace(/\n/g, " "); 
      const inputs = fs.querySelectorAll("input[type='radio']");
      let selectedValue = "";

      inputs.forEach((input) => {
        if (input.checked) {
          selectedValue = escapeMarkdown(input.value);
        }
      });

      if (selectedValue) {
        markdown += `${count}. ${questionText} \n\n    Answer: ${selectedValue} \n\n`;
        count++;
      }
    });

    return markdown.trim();
  }

  function updateQ7Visibility() {
    const yesSelected = ["q1", "q2", "q3", "q4", "q5", "q6"].some((qName) => {
      return Array.from(form[qName]).some(
        (input) => input.checked && input.value === "Yes"
      );
    });

    if (yesSelected) {
      q7Details.open = true;
      form.q7.forEach((r) => (r.required = true));
    } else {
      q7Details.open = false;
      form.q7.forEach((r) => (r.required = false));
    }
  }

  form.q1.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "Yes" && input.checked) {
        q2Details.open = true;
        form.q2.forEach((r) => (r.required = true));
      } else if (input.value === "No" && input.checked) {
        q2Details.open = false;
        form.q2.forEach((r) => {
          r.required = false;
        });
      }
      updateQ7Visibility();
    });
  });

  ["q2", "q3", "q4", "q5", "q6"].forEach((qName) => {
    form[qName].forEach((input) => {
      input.addEventListener("change", updateQ7Visibility);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const issueTitle = encodeURIComponent(document.title);
    const issueBody = encodeURIComponent(generateMarkdown(form));
    const githubOrg = document.getElementById("org").value.trim();
    const githubRepo = document.getElementById("repo").value.trim();

    if (!githubOrg || !githubRepo) {
      alert("Please enter both GitHub organisation and repository.");
      return;
    }

    const issueUrl = `https://github.com/${githubOrg}/${githubRepo}/issues/new?title=${issueTitle}&body=${issueBody}&labels=a11y-tracker`;
    window.open(issueUrl, "_self");
  });
});
