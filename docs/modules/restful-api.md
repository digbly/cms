# RESTful API Response Helpers

The `RestResponses` trait is used to provide a set of methods for generating JSON responses for RESTful API calls. This trait is designed to be used in a Juzaweb application to standardize the way API responses are generated.

This trait is included in `Juzaweb\Modules\Admin\Http\Controllers\Controller` by default.

## `restSuccess` Method

The `restSuccess` method is used to generate a JSON response for a successful REST API call. It takes four parameters:

```php
return $this->restSuccess(
    $data, // data to include in the response
    'Get data successfully.', // optional message
    200, // HTTP status code
    ['code' => 'CUSTOM_CODE'] // additional data to merge into the response
);
```

This will generate a JSON response with the following structure:

```json
{
    "success": true,
    "message": "Get data successfully.",
    "data": [...], // data passed in the $data parameter
    "code": "CUSTOM_CODE" // additional data passed in the $with parameter
}
```

## `restFail` Method

The `restFail` method is used to generate a JSON response for an error REST API call. It takes three parameters:

* `$message`: The error message to include in the response.
* `$status`: The HTTP status code for the response. Defaults to 422.
* `$with`: Additional data to merge into the response.

Here's an example of how to use the restFail method:

```php
return $this->restFail(
    'Error message', // error message
    422, // HTTP status code
    ['code' => 'CUSTOM_ERROR_CODE'] // additional data to merge into the response
);
```

This will generate a JSON response with the following structure:

```json
{
    "success": false,
    "message": "Error message",
    "code": "CUSTOM_ERROR_CODE"
}
```

The `code` field is additional data that can be used to provide more context about the error.
