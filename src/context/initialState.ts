import { LegislationNode } from '../types';

export const initialLegislationState: LegislationNode = {
    type: 'act',
    attributes: {
        'date.assent': new Date().toISOString().split('T')[0],
        id: 'DLM_NEW',
    },
    children: [
        {
            type: 'cover',
            children: [
                {
                    type: 'title',
                    content: 'New Legislation Act 2024',
                },
            ],
        },
        {
            type: 'body',
            children: [
                {
                    type: 'part',
                    attributes: { id: 'P1' },
                    children: [
                        {
                            type: 'label',
                            attributes: { 'auto.number': 'no' },
                            content: 'Part 1',
                        },
                        {
                            type: 'heading',
                            content: 'Preliminary provisions',
                        },
                        {
                            type: 'section',
                            attributes: { id: 'S1' },
                            children: [
                                {
                                    type: 'label',
                                    attributes: { 'auto.number': 'yes' },
                                    content: '1',
                                },
                                {
                                    type: 'heading',
                                    content: 'Title',
                                },
                                {
                                    type: 'subsection',
                                    attributes: { id: 'S1-1' },
                                    children: [
                                        {
                                            type: 'label',
                                            content: '(1)',
                                        },
                                        {
                                            type: 'text',
                                            content: 'This Act is the New Legislation Act 2024.',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
