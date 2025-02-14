import Button from '../../../../admin-x-ds/global/Button';
import Heading from '../../../../admin-x-ds/global/Heading';
import List from '../../../../admin-x-ds/global/List';
import ListItem from '../../../../admin-x-ds/global/ListItem';
import NiceModal from '@ebay/nice-modal-react';
import React, {ReactNode, useState, useEffect} from 'react';
import useHandleError from '../../../../utils/api/handleError';
import {ConfirmationModalContent} from '../../../../admin-x-ds/global/modal/ConfirmationModal';
import {InstalledTheme, ThemeProblem, useActivateTheme} from '../../../../api/themes';
import {showToast} from '../../../../admin-x-ds/global/Toast';

export const ThemeProblemView = ({problem}:{problem: ThemeProblem}) => {
    const [isExpanded, setExpanded] = useState(false);



    
    return <ListItem
        title={
            <>
                <div className={`${problem.level === 'error' ? 'before:bg-red' : 'before:bg-yellow'} relative px-4 text-sm before:absolute before:left-0 before:top-1.5 before:block before:h-2 before:w-2 before:rounded-full before:content-['']`}>
                    <strong>{problem.level === 'error' ? 'Error: ' : 'Warning: '}</strong>
                    <span dangerouslySetInnerHTML={{__html: problem.rule}} />
                    <div className='absolute -right-4 top-1'>
                        <Button color="green" icon={isExpanded ? 'chevron-down' : 'chevron-right'} iconColorClass='text-grey-700' size='sm' link onClick={() => setExpanded(!isExpanded)} />
                    </div>
                </div>
                {
                    isExpanded ?
                        <div className='mt-2 px-4 text-[13px] leading-8'>
                            <div dangerouslySetInnerHTML={{__html: problem.details}} className='mb-4' />
                            <Heading level={6}>Affected files:</Heading>
                            <ul className='mt-1'>
                                {problem.failures.map(failure => <li><code>{failure.ref}</code>{failure.message ? `: ${failure.message}` : ''}</li>)}
                            </ul>
                        </div> :
                        null
                }
            </>
        }
        hideActions
        separator
    />;
};

const ThemeInstalledModal: React.FC<{
    title: string
    prompt: ReactNode
    installedTheme: InstalledTheme;
    onActivate?: () => void;
}> = ({title, prompt, installedTheme, onActivate}) => {
    const {mutateAsync: activateTheme} = useActivateTheme();
    const handleError = useHandleError();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Set up a listener for changes in the color scheme
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Initial setup
        setIsDarkMode(darkModeMediaQuery.matches);

        // Handle color scheme changes
        const handleColorSchemeChange = (event: MediaQueryListEvent) => {
            setIsDarkMode(event.matches);
        };

        darkModeMediaQuery.addListener(handleColorSchemeChange);

        // Clean up the listener when the component is unmounted
        return () => {
            darkModeMediaQuery.removeListener(handleColorSchemeChange);
        };
    }, []); 


    
    let errorPrompt = null;
    if (installedTheme.gscan_errors) {
        errorPrompt = <div className={`mt-6 ${isDarkMode? 'text-white' : ''}`}>
            <List hint={<>Highly recommended to fix, functionality <strong>could</strong> be restricted</>} title="Errors">
                {installedTheme.gscan_errors?.map(error => <ThemeProblemView problem={error} />)}
            </List>
        </div>;
    }

    let warningPrompt = null;
    if (installedTheme.warnings) {
        warningPrompt = <div className="mt-10">
            <List title="Warnings">
                {installedTheme.warnings?.map(warning => <ThemeProblemView problem={warning} />)}
            </List>
        </div>;
    }

    let okLabel = `Activate${installedTheme.gscan_errors?.length ? ' with errors' : ''}`;

    if (installedTheme.active) {
        okLabel = 'OK';
    }

    return <ConfirmationModalContent
        cancelLabel='Close'
        okColor='black'
        okLabel={okLabel}
        okRunningLabel='Activating...'
        prompt={<>
            {prompt}

            {errorPrompt}
            {warningPrompt}
        </>}
        title={title}
        onOk={async (activateModal) => {
            if (!installedTheme.active) {
                try {
                    const resData = await activateTheme(installedTheme.name);
                    const updatedTheme = resData.themes[0];

                    showToast({
                        type: 'success',
                        message: <div><span className='capitalize'>{updatedTheme.name}</span> is now your active theme.</div>
                    });
                } catch (e) {
                    handleError(e);
                }
            }
            onActivate?.();
            activateModal?.remove();
        }}
    />;
};

export default NiceModal.create(ThemeInstalledModal);
