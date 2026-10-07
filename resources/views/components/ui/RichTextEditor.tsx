import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';

const CKEDITOR_SCRIPT_ID = 'ckeditor-cdn-script';
const CKEDITOR_VERSION = '41.3.1';
const CKEDITOR_SCRIPT_SRC = `https://cdn.ckeditor.com/ckeditor5/${CKEDITOR_VERSION}/classic/ckeditor.js`;

interface ModelNode {
    name: string | null;
}

interface ModelWriter {
    setAttribute: (key: string, value: unknown, node: ModelNode) => void;
}

interface ClassicEditorInstance {
    getData: () => string;
    setData: (data: string) => void;
    destroy: () => Promise<void>;
    execute: (command: string, options?: Record<string, unknown>) => void;
    editing: { view: { focus: () => void } };
    model: {
        document: {
            on: (event: string, callback: () => void) => void;
            selection: { getSelectedElement: () => ModelNode | null };
        };
        change: (callback: (writer: ModelWriter) => void) => void;
    };
}

interface ClassicEditorStatic {
    create: (element: HTMLElement, config: Record<string, unknown>) => Promise<ClassicEditorInstance>;
}

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
    maxHeight?: number;
    /** When provided, renders a toolbar button that opens a media picker. */
    onRequestMedia?: (insert: (url: string, alt?: string) => void) => void;
    mediaLabel?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = '',
    minHeight = 280,
    maxHeight = 600,
    onRequestMedia,
    mediaLabel,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<ClassicEditorInstance | null>(null);
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);
    const [isLoaded, setIsLoaded] = useState(
        () => typeof window !== 'undefined' && Boolean((window as unknown as { ClassicEditor?: ClassicEditorStatic }).ClassicEditor)
    );

    useEffect(() => {
        onChangeRef.current = onChange;
        valueRef.current = value;
    }, [onChange, value]);

    useEffect(() => {
        const globalWindow = window as unknown as { ClassicEditor?: ClassicEditorStatic };

        if (globalWindow.ClassicEditor) {
            return;
        }

        const existingScript = document.getElementById(CKEDITOR_SCRIPT_ID);

        if (existingScript) {
            const handleLoad = () => setIsLoaded(true);
            existingScript.addEventListener('load', handleLoad);

            return () => existingScript.removeEventListener('load', handleLoad);
        }

        const script = document.createElement('script');
        script.id = CKEDITOR_SCRIPT_ID;
        script.src = CKEDITOR_SCRIPT_SRC;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error('Failed to load CKEditor from CDN.');
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!isLoaded || !editorRef.current || instanceRef.current) {
            return;
        }

        const ClassicEditor = (window as unknown as { ClassicEditor?: ClassicEditorStatic }).ClassicEditor;

        if (!ClassicEditor) {
            return;
        }

        let isDisposed = false;

        ClassicEditor.create(editorRef.current, {
            placeholder,
            heading: {
                options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                    { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                ],
            },
            toolbar: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                '|',
                'link',
                '|',
                'bulletedList',
                'numberedList',
                '|',
                'blockQuote',
                'codeBlock',
                '|',
                'alignment',
                'horizontalLine',
                'removeFormat',
                '|',
                'undo',
                'redo',
            ],
        })
            .then((editor) => {
                if (isDisposed) {
                    void editor.destroy();

                    return;
                }

                instanceRef.current = editor;
                editor.setData(valueRef.current || '');
                editor.model.document.on('change:data', () => {
                    onChangeRef.current(editor.getData());
                });
            })
            .catch((error: unknown) => {
                console.error('CKEditor initialization error:', error);
            });

        return () => {
            isDisposed = true;
            const editor = instanceRef.current;
            instanceRef.current = null;

            if (editor) {
                void editor.destroy().catch((error: unknown) => {
                    console.error('CKEditor destroy error:', error);
                });
            }
        };
    }, [isLoaded, placeholder]);

    useEffect(() => {
        const editor = instanceRef.current;

        if (editor && value !== undefined && editor.getData() !== value) {
            editor.setData(value);
        }
    }, [value]);

    const insertImage = (url: string, alt?: string): void => {
        const editor = instanceRef.current;

        if (!editor) {
            return;
        }

        // CKEditor 5 owns the insertion through its image command; the model
        // element is `imageBlock`/`imageInline` (not `image`), so building the
        // node manually would be silently rejected by the schema.
        editor.editing.view.focus();
        editor.execute('insertImage', { source: url });

        if (!alt) {
            return;
        }

        const selected = editor.model.document.selection.getSelectedElement();

        if (selected && (selected.name === 'imageBlock' || selected.name === 'imageInline')) {
            editor.model.change((writer) => writer.setAttribute('alt', alt, selected));
        }
    };

    return (
        <div className="ckeditor-wrapper overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.08]">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .ckeditor-wrapper .ck-editor__editable {
                            color: #0f172a !important;
                            background-color: #ffffff !important;
                        }
                        .ckeditor-wrapper .ck-editor__editable_inline {
                            min-height: ${minHeight}px !important;
                            max-height: ${maxHeight}px !important;
                            overflow-y: auto !important;
                        }
                    `,
                }}
            />
            {onRequestMedia && (
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    <button
                        type="button"
                        onClick={() => onRequestMedia(insertImage)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-indigo-400"
                    >
                        <ImagePlus className="h-4 w-4" />
                        {mediaLabel}
                    </button>
                </div>
            )}
            <div ref={editorRef} />
        </div>
    );
}
