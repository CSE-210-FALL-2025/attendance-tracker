# Google Form Configuration Template

## Form Fields Setup

Create a Google Form with the following fields:

### 1. Name Field
- **Type**: Short answer
- **Question**: "What is your full name?"
- **Required**: Yes
- **Validation**: None

### 2. Student ID Field
- **Type**: Short answer
- **Question**: "What is your student ID?"
- **Required**: Yes
- **Validation**: 
  - Number
  - Between 100000 and 999999 (adjust range as needed)

### 3. Email Field
- **Type**: Short answer
- **Question**: "What is your email address?"
- **Required**: Yes
- **Validation**: 
  - Text
  - Contains "@"

### 4. Session ID Field
- **Type**: Short answer
- **Question**: "Session ID (auto-filled)"
- **Required**: Yes
- **Validation**: 
  - Text
  - Contains "session_"
- **Description**: "This field is automatically filled when you scan the QR code"

## Form Settings

### General Settings
- **Collect email addresses**: Yes (if you want to track submissions)
- **Limit to 1 response**: Yes (prevents duplicate submissions)
- **Show link to submit another response**: No

### Presentation
- **Show progress bar**: Yes
- **Shuffle question order**: No
- **Show link to submit another response**: No

### Quizzes (if using)
- **Make this a quiz**: No (unless you want to add quiz features)

## Response Collection

### Response Destination
- **Google Sheets**: Recommended for easy data management
- **Email notifications**: Enable to get notified of new submissions

### Response Settings
- **Accepting responses**: Yes
- **Show summary charts**: Yes
- **Publish and show a public link to form results**: No (for privacy)

## Security Considerations

1. **Form Access**: Set to "Anyone with the link can respond"
2. **Response Validation**: Use the session ID validation to prevent unauthorized submissions
3. **Data Collection**: Consider privacy implications of collecting student data

## Testing the Form

1. Create a test session ID: `session_1234567890_test123`
2. Manually test the form with this session ID
3. Verify that validation works correctly
4. Test the QR code scanning flow

## Form URL Format

Your form URL should look like:
```
https://docs.google.com/forms/d/e/1FAIpQLSdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/viewform
```

Extract the form ID (the long string between `/d/e/` and `/viewform`) and replace `YOUR_FORM_ID_HERE` in the JavaScript file.

## Advanced Configuration

### Custom Validation Rules

You can add more sophisticated validation:

```javascript
// Example: Validate student ID format
function validateStudentId(studentId) {
    return /^[A-Z]{2}\d{6}$/.test(studentId); // Format: AB123456
}

// Example: Validate email domain
function validateEmailDomain(email) {
    return email.endsWith('@university.edu');
}
```

### Response Processing

Consider adding Google Apps Script to process responses:

```javascript
function onFormSubmit(e) {
    const responses = e.values;
    const sessionId = responses[3]; // Assuming session ID is 4th field
    
    // Validate session ID
    if (!sessionId.startsWith('session_')) {
        // Handle invalid session
        return;
    }
    
    // Process valid attendance
    Logger.log('Valid attendance recorded for session: ' + sessionId);
}
```

## Troubleshooting

### Common Issues

1. **Form not accepting responses**
   - Check form settings
   - Verify form is published
   - Ensure "Accepting responses" is enabled

2. **Session ID validation failing**
   - Check validation rules
   - Verify session ID format
   - Test with manual input

3. **QR code not opening form**
   - Verify form URL is correct
   - Check form accessibility
   - Test URL manually in browser

### Debug Steps

1. Test form manually with a sample session ID
2. Verify QR code contains correct URL
3. Check browser console for JavaScript errors
4. Test on different devices/browsers
