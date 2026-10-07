<?php

namespace App\Support;

use DOMComment;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMProcessingInstruction;

/**
 * Allowlist HTML sanitizer for rich-text content produced by the CMS editor.
 *
 * It keeps a small set of formatting tags and safe attributes, drops scripts
 * and event handlers, and rejects dangerous URL schemes. Unknown tags are
 * unwrapped so their text survives without their markup.
 */
class HtmlSanitizer
{
    /**
     * @var list<string>
     */
    private const ALLOWED_TAGS = [
        'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins', 'mark', 'sub', 'sup', 'span', 'div',
        'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr',
        'figure', 'figcaption', 'img', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    ];

    /**
     * Tags removed together with their content.
     *
     * @var list<string>
     */
    private const DROPPED_TAGS = [
        'script', 'style', 'iframe', 'object', 'embed', 'applet', 'form', 'input',
        'textarea', 'select', 'option', 'button', 'link', 'meta', 'base', 'title',
        'head', 'noscript', 'template', 'svg', 'math',
    ];

    /**
     * @var array<string, list<string>>
     */
    private const ALLOWED_ATTRIBUTES = [
        '*' => ['class', 'title', 'style'],
        'a' => ['href', 'target', 'rel'],
        'img' => ['src', 'alt', 'width', 'height', 'loading'],
        'ol' => ['start', 'type'],
        'td' => ['colspan', 'rowspan'],
        'th' => ['colspan', 'rowspan', 'scope'],
    ];

    public function sanitize(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        $document = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);

        $loaded = $document->loadHTML(
            '<?xml encoding="UTF-8"><div id="sanitizer-root">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $loaded ? $document->getElementsByTagName('div')->item(0) : null;

        if ($root === null) {
            return '';
        }

        $this->cleanChildren($root);

        $output = '';

        foreach ($root->childNodes as $child) {
            $output .= $document->saveHTML($child);
        }

        return trim($output);
    }

    private function cleanChildren(DOMNode $parent): void
    {
        foreach (iterator_to_array($parent->childNodes) as $child) {
            if ($child instanceof DOMComment || $child instanceof DOMProcessingInstruction) {
                $parent->removeChild($child);

                continue;
            }

            if (! $child instanceof DOMElement) {
                continue;
            }

            $tag = strtolower($child->nodeName);

            if (in_array($tag, self::DROPPED_TAGS, true)) {
                $parent->removeChild($child);

                continue;
            }

            if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                $this->cleanChildren($child);

                while ($child->firstChild !== null) {
                    $parent->insertBefore($child->firstChild, $child);
                }

                $parent->removeChild($child);

                continue;
            }

            $this->cleanAttributes($child, $tag);
            $this->cleanChildren($child);
        }
    }

    private function cleanAttributes(DOMElement $element, string $tag): void
    {
        $allowed = array_merge(
            self::ALLOWED_ATTRIBUTES['*'],
            self::ALLOWED_ATTRIBUTES[$tag] ?? []
        );

        foreach (iterator_to_array($element->attributes) as $attribute) {
            $name = strtolower($attribute->nodeName);

            if (! in_array($name, $allowed, true) || str_starts_with($name, 'on')) {
                $element->removeAttribute($attribute->nodeName);

                continue;
            }

            if (in_array($name, ['href', 'src'], true) && ! $this->isSafeUrl($attribute->value)) {
                $element->removeAttribute($attribute->nodeName);

                continue;
            }

            if ($name === 'style') {
                $safe = $this->safeStyle($attribute->value);

                if ($safe === '') {
                    $element->removeAttribute($attribute->nodeName);
                } else {
                    $element->setAttribute('style', $safe);
                }
            }
        }

        if ($tag === 'a' && $element->hasAttribute('target')) {
            $element->setAttribute('rel', 'noopener noreferrer');
        }
    }

    private function isSafeUrl(string $url): bool
    {
        $url = trim(html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        if ($url === '' || str_starts_with($url, '/') || str_starts_with($url, '#')) {
            return true;
        }

        $colon = strpos($url, ':');

        if ($colon === false) {
            return true;
        }

        $scheme = preg_replace('/[\s\x00-\x1f]/', '', strtolower(substr($url, 0, $colon)));

        return in_array($scheme, ['http', 'https', 'mailto', 'tel'], true);
    }

    private function safeStyle(string $style): string
    {
        $safe = [];

        foreach (explode(';', $style) as $declaration) {
            if (! str_contains($declaration, ':')) {
                continue;
            }

            [$property, $value] = array_map('trim', explode(':', $declaration, 2));

            if (strtolower($property) !== 'text-align') {
                continue;
            }

            $value = strtolower($value);

            if (in_array($value, ['left', 'right', 'center', 'justify'], true)) {
                $safe[] = 'text-align: '.$value;
            }
        }

        return implode('; ', $safe);
    }
}
