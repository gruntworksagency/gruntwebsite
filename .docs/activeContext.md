RIPER·Ω₃ Active [Session: AuditContactForm]

### Project Plan: Audit Contact Form Page (Revised)

#### Purpose

Create a new static Astro page for an audit contact form, enabling users to submit basic info for audits. Align with site style: one-column layout, MainLayout, Preline UI for forms, Tailwind CSS. The form will be structured for future server-side handling, but initial API route implementation for email or database storage is deferred.

#### Structure Outline

- **Page Layout**: Use `MainLayout.astro` for consistency (header, footer). Single section with title (`<h1>`), short description (`<p>`), and a form.
- **Form Elements**: Standard HTML `<form>` with fields (name, email, phone, message) using existing input components (`TextInput`, `EmailContactInput`, `PhoneInput`, `TextAreaInput`) and Preline UI classes for styling. The form will use `method="POST"`.
- **Styling**: Match `contact.astro` for responsive layout and overall design. Dark mode support is not required.
- **Accessibility/SEO**: Add `aria-labels` and appropriate meta tags via `MainLayout` props.
- **Validation**: Basic client-side validation using HTML5 attributes like `required` and `type="email"`. Server-side validation and submission logic will be addressed in a later phase.

#### Planned Phases

1.  **Setup**: Review existing `ContactSection.astro` for form component usage and general layout patterns.
2.  **Development**: Create the new Astro page file (`src/pages/audit.astro`) and integrate the necessary form input components.
3.  **Testing**: Manually test the form's display, client-side validation, and responsiveness across different screen sizes. Verify that the page renders correctly within the existing site structure.
4.  **Deployment**: Build and verify the page in a production environment.

#### Required Context

- Dependencies: Astro 5.x, Preline UI, Tailwind CSS.
- Edge Cases: Focus only on basic form presentation and client-side validation for now. Server-side concerns (e.g., empty fields, invalid email, spam prevention, large messages, email integration, database storage) are out of scope for this phase.
- Example Snippet (for illustration only, not final code):

  ```astro
  // src/pages/audit.astro (example structure)
  ---
  import MainLayout from "@/layouts/MainLayout.astro";
  // Import input components as needed:
  // import TextInput from "@components/ui/forms/input/TextInput.astro";
  // import EmailContactInput from "@components/ui/forms/input/EmailContactInput.astro";
  // import PhoneInput from "@components/ui/forms/input/PhoneInput.astro";
  // import TextAreaInput from "@components/ui/forms/input/TextAreaInput.astro";
  // import AuthBtn from "@components/ui/buttons/AuthBtn.astro";

  const pageTitle: string = "Audit Contact Form";
  const metaDescription: string = "Submit your information for an audit request.";
  ---

  <MainLayout
    title={pageTitle}
    customDescription={metaDescription}
  >
    <section class="mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="mx-auto max-w-2xl lg:max-w-5xl">
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight text-balance text-neutral-800 md:text-4xl md:leading-tight">
            Audit Contact Request
          </h1>
          <p class="mt-1 text-pretty text-neutral-600">
            Please fill out the form below with your information, and we will get back to you shortly regarding your audit request.
          </p>
        </div>

        <div class="mt-12 flex flex-col rounded-xl p-4 sm:p-6 lg:p-8">
          <h2 class="mb-8 text-xl font-bold text-neutral-700">Your Information</h2>
          <form method="POST">
            <div class="grid gap-4">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- Example of using TextInput -->
                <!-- <TextInput id="audit-firstname" label="First Name" name="firstname" required /> -->
                <!-- <TextInput id="audit-lastname" label="Last Name" name="lastname" required /> -->
              </div>
              <!-- <EmailContactInput id="audit-email" required /> -->
              <!-- <PhoneInput id="audit-phone" /> -->
              <!-- <TextAreaInput id="audit-message" label="Message" name="message" rows="4" required /> -->
            </div>
            <div class="mt-4 grid">
              <!-- <AuthBtn title="Submit Request" /> -->
            </div>
          </form>
        </div>
      </div>
    </section>
  </MainLayout>
  ```

ACTION PLAN CHECKLIST:

1.  [Create new file `src/pages/audit.astro` with `MainLayout` import and basic structure.]
2.  [Add title (`Audit Contact Request`) and a short description to `audit.astro` in a one-column layout.]
3.  [Implement HTML form in `audit.astro` with `method="POST"` and appropriate input fields (First Name, Last Name, Email, Phone Number, Message) using existing input components (`TextInput`, `EmailContactInput`, `PhoneInput`, `TextAreaInput`) and Preline UI styling classes.]
4.  [Ensure client-side validation using HTML5 `required` attributes for relevant form fields.]
5.  [Test the page to ensure the form and its elements are displayed correctly and are responsive.]

Plan complete. Switch to Execute Agent.
