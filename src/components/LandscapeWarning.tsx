import { useLocale } from '../contexts/LocaleContext';

export const LandscapeWarning = () => {
    const locale = useLocale();
    return (
        <div className="landscape-warning">
            <div className="landscape-warning__content">
                <span className="landscape-warning__icon">⟳</span>
                <p>{locale.landscapeWarning.message}</p>
            </div>
        </div>
    );
};
