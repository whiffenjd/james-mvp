import React from 'react';

interface HistoryItem {
    id: string;
    description: string;
    timeAgo: string;
    timestamp: string;
    entityType: string;
    action: string;
}

interface HistoryTimelineProps {
    history: HistoryItem[];
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history }) => {

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
            <h2 className="text-lg font-semibold text-[#000000B2]/80 mb-4">Last Actions</h2>

            {history.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No recent actions.</div>
            ) : (
                <div className="space-y-4">
                    {history.map((item, index) => (
                        <div key={item.id} className="flex items-start space-x-3 relative">
                            {/* Timeline dot */}
                            <div className="flex-shrink-0 mt-1 relative z-10">
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center"

                                >
                                    <div className="w-2 h-2 rounded-full bg-black" />
                                </div>
                            </div>


                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-2">
                                <div className="text-sm text-[#000000CC]/80 font-medium leading-5 ">
                                    {item.description}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {item.timeAgo}
                                </div>
                            </div>

                            {/* Connecting line */}
                            {index < history.length - 1 && (
                                <div className="absolute -left-[4px] top-[1.40rem] w-px bg-black h-full z-0" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
