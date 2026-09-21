# Cinci360 analytics

The site sends analytics to GA4 measurement ID `G-SYVFL4853B` from every route. `NEXT_PUBLIC_GA4_MEASUREMENT_ID` can override that ID for a separate environment.

## Conversion funnel

- `lead_form_view`: the project inquiry reaches 50% visibility.
- `lead_form_start`: the first interaction with the inquiry form.
- `lead_form_field_complete`: a named field becomes valid; only the field name is sent.
- `lead_form_validation_error`: a required field is invalid; only the field name is sent.
- `lead_form_abandon`: someone starts but leaves before submitting.
- `lead_form_submit`: the inquiry is submitted to the existing endpoint.
- `generate_lead`: the visitor reaches the confirmed `?sent=1` state. This is the primary GA4 key event.

## Intent signals

- `contact_cta_click`, `contact_click`
- `service_interest`, `case_study_click`
- `virtual_tour_view`, `virtual_tour_click`
- `review_profile_click`
- `linkedin_profile_click`, `social_profile_click`
- `file_download`, `outbound_click`, `navigation_click`, `navigation_menu_toggle`

## Engagement and attribution

- `content_view` categorizes home, FAQ, case studies, IT services, and reality-capture service pages.
- `section_view` measures 50%-visible sections.
- `scroll_depth` records 25%, 50%, 75%, and 90% milestones.
- `engaged_time` records visible-page milestones at 30, 60, and 120 seconds.
- UTM parameters plus `gclid` and `msclkid` persist for the session and attach to lead submissions and confirmed leads.

No form values, names, email addresses, phone numbers, or project descriptions are sent to Analytics.
