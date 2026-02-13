import React from "react"; 

type ComingSoonProps = { 

    label?: string;
    className?: string;
};

export const ComingSoon: React.FC<ComingSoonProps> = ({
    label = "Coming soon",
    className = ""
}) => {
    return (
    <span
    className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        "bg-gray-100 text-gray-700 border-gray-300",
        className
    ].join(" ")}
    aria-label={label}
    >
        {label}
    </span>
    );
};

type DisabledSoonProps = {
    children: React.ReactNode;
    label?: string;
    className?: string;
};

/**
 * Shows that UI element is planned but not currently functional
 * Mutes and prevents clicking 
 */

export const DisabledSoon: React.FC<DisabledSoonProps> = ({
    children,
    label = "Coming soon",
    className = ""
}) => {
    return (
        <div className={["opacity-50 pointer-events-none", className].join(" ")}>
            <div className="flex items-center gap-2">
                <ComingSoon label={label} />
            </div>
            <div className="mt-2">{children}</div>
        </div>
    );
};

export default ComingSoon; 