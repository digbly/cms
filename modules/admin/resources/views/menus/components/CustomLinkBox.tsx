import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import type { MenuItem } from '../types';

interface CustomLinkBoxProps {
    onAddItems: (items: MenuItem[]) => void;
}

let tempCounter = 0;

export default function CustomLinkBox({ onAddItems }: CustomLinkBoxProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [link, setLink] = useState('');

    const handleAdd = () => {
        if (!label.trim() || !link.trim()) {
            return;
        }

        onAddItems([
            {
                id: `new-${Date.now()}-custom-${(tempCounter += 1)}`,
                label,
                link,
                target: '_self',
                is_custom: true,
                box_key: 'custom',
                menuable_id: null,
                menuable_type: null,
                menuable_class_name: null,
                children: [],
            },
        ]);

        setLabel('');
        setLink('');
    };

    return (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-slate-900">
            <button
                type="button"
                onClick={() => setIsOpen((value) => !value)}
                className="flex w-full items-center justify-between bg-slate-50/60 px-4 py-3 transition-colors hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
            >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {t('admin.menus.customLink.title', 'Custom link')}
                </span>
                <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="space-y-4 border-t border-slate-100 p-4 dark:border-white/[0.06]">
                    <Input
                        label={t('admin.menus.customLink.url', 'URL')}
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                        placeholder="https://"
                    />

                    <Input
                        label={t('admin.menus.customLink.label', 'Link text')}
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder={t('admin.menus.customLink.labelPlaceholder', 'Link text')}
                    />

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAdd}
                            disabled={!label.trim() || !link.trim()}
                            leftIcon={<Plus className="h-4 w-4" />}
                        >
                            {t('admin.menus.customLink.addToMenu', 'Add to menu')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
