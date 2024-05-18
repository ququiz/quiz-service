# Post Create Quiz

Create a new quiz.

Method: `POST`
Endpoint: `/quiz`

## Request

- Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

- Body
```json
{
  "title": string,
  "start_time": "2024-05-19T10:00:00.000Z", // DATE
  "end_time": "2024-05-19T12:00:00.000Z", // DATE
  "questions": [{
    "question": string,
    "type": "MULTIPLE", // ENUM("MULTIPLE", "ESSAY")
    "weight": number,
    "choices": [
      {
        "text": string,
        "is_correct": boolean // DEFAULT FALSE
      }
    ] // Required if type is "MULTIPLE" and length >= 2
    "essay_answer": string // Will be used if type is "ESSAY"
  }]
}
```

## Response

- 201: Created

```json
{
  "message": "Quiz created successfully",
  "data": {
    "created_quiz": {
      "id": "6648c7acc565c7caee7dad18" // Object Id
    }
  }
}
```
