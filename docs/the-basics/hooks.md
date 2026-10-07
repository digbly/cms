Actions and filters in Laravel. WordPress-style. Actions are pieces of code you want to execute at certain points in your code. Actions never return anything but merely serve as the option to hook in to your existing code without having to mess things up. Filters are made to modify entities. They always return some kind of value. By default, they return their first parameter, and you should too.

### Actions
#### Helper functions
**Do action hook helper function**
```php
function do_action($tag, ...$args)
```

- **@param string $tag**: Name/key of action
- **@param mixed ...$args**: Additional parameters to pass to the callback functions.
- **@return void**

**Add action to hook**
```php
function add_action($tag, $callback, $priority = 20, $arguments = 1)
```
- **@param string $tag** The name of the filter to hook the **$function_to_add** callback to.
- **@param callable $callback** The callback to be run when the filter is applied.
- **@param int $priority** (Optional)
  - Used to specify the order in which the functions associated with a particular action are executed.
  - Lower numbers correspond with earlier execution, and functions with the same priority are executed in the order in which they were added to the action.
  - Default 20.
- **@param int $arguments** (Optional)
  - The number of arguments the function accepts.
  - Default 1.
- **@return** void

#### Example
- Anywhere in your code you can create a new action like so:
```php
do_action('my.hook', $user);
```

- The first parameter is the name of the hook; you will use this at a later point when you'll be listening to your hook. All subsequent parameters are sent to the action as parameters. These can be anything you'd like. For example, you might want to tell the listeners that this is attached to a certain model. Then you would pass this as one of the arguments.

- To listen to your hooks, you attach listeners. These are best added to file in actions folder in your plugin

For example if you wanted to hook in to the above hook, you could do:
```php
add_action('my.hook', function($user) {
    if ($user->is_awesome) {
         $this->doSomethingAwesome($user);
    }
}, 20, 1);
```

### Filters
#### Helper functions
```php
function apply_filters($tag, $value, ...$args) {}
```

- Apply filters to value
- **@param string $tag** The name of the filter hook.
- **@param mixed $value** The value to filter.
- **@param mixed  ...$args** Additional parameters to pass to the callback functions.
- **@return mixed** The filtered value after all hooked functions are applied to it.

```php
function add_filters($tag, $callback, $priority = 20, $arguments = 1) {}
```
- **@param string $tag** The name of the filter to hook the $function_to_add callback to.
- **@param callable $callback** The callback to be run when the filter is applied.
- **@param int $priority** (Optional)
  - Used to specify the order in which the functions associated with a particular action are executed.
  - Lower numbers correspond with earlier execution, and functions with the same priority are executed in the order in which they were added to the action.
  - Default 20.
- **@param int $arguments** (Optional). The number of arguments the function accepts. Default 1.
- **@return bool**
#### Example
- Filters work in much the same way as actions and have the exact same build-up as actions. The most significant difference is that filters always return their value.

```php
$value = apply_filters('my.hook', 'awesome');
```

- If no listeners are attached to this hook, the filter would simply return `'awesome'`.
- This is how you add a listener to this filter (still in the **actions** folder files)
```php
add_filters('my.hook', function($what) {
    $what = 'not '. $what;
    return $what;
}, 20, 1);
```

- The filter would now return `'not awesome'`. Neat!
- You could use this in conjunction with the previous hook:
```php
add_action('my.hook', function($what) {
    $what = add_filters('my.hook', 'awesome');
    echo 'You are '. $what;
});
```

### Using in Blade
Adding the same action as the one in the action example above:
```php
@do_action('my.hook', $user)
```
Adding the same filter as the one in the filter example above:

```
You are @apply_filters('my.hook', 'awesome')
```

### Using Facade
You can also use the `Hook` facade to manage actions and filters.

```php
use Juzaweb\Hooks\Facades\Hook;

// Add action
Hook::addAction('my.hook', function($user) {
    // ...
});

// Do action
Hook::action('my.hook', $user);

// Add filter
Hook::addFilter('my.hook', function($value) {
    return $value;
});

// Apply filter
$value = Hook::filter('my.hook', $value);

// Remove specific action callback
Hook::removeAction('my.hook', $callback, $priority);

// Remove all actions for a hook
Hook::removeAllActions('my.hook');

// Remove specific filter callback
Hook::removeFilter('my.hook', $callback, $priority);

// Remove all filters for a hook
Hook::removeAllFilters('my.hook');

// Check if hook has listeners
if (Hook::hasListeners('my.hook')) {
    // ...
}

// Get all listeners for a hook
$listeners = Hook::getListeners('my.hook');
```
