import {
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import styles from "../app/page.module.css";

export function AppSidebar() {

    const filterList = () => {
        window.dispatchEvent(new Event('refreshSounds'))
    }

    return (
        <Sidebar >
            <SidebarContent>
                <div id="menuWrapper" className={styles.menuWrapper}>
                    <div className={styles.section}>
                        <div style={{ marginBottom: 16 }}>
                            <Input id="categorySearchInput" type="text" placeholder="Search..." className={styles.searchInput} />
                        </div>

                        <div className={styles.titleBar}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Selected Items</h2>
                            <button id="categoryClearSelection" style={{ fontSize: '0.875rem' }}>Clear</button>
                        </div>
                    </div>

                    <ScrollArea className="h-72 rounded-md border">
                        <div id="menuContainer" className={`${styles.section} ${styles.menuContainer}`}>
                            <div id="selectedItemsContainer" className={styles.selectedItemsContainer}></div>

                            <div id="categoryBackButtonContainer" className={styles.backButtonContainer} style={{ display: 'none' }}>
                                <button id="categoryBackButton" style={{ fontSize: '0.875rem' }}>← Back</button>
                            </div>

                            <div id="categoryMenuContainer" className={styles.categoryMenuContainer}></div>
                        </div>
                    </ScrollArea>

                    <div id="menuSubmitDiv">
                        <button id="menuSubmitButton" className={styles.submitButton} onClick={filterList}>
                            Filter List
                        </button>
                    </div>

                    <div className={styles.section}>
                        <h3>Duration</h3>
                        <div>
                            <label htmlFor="minDuration">Min:</label>
                            <input id="minDuration" name="minDuration" type="range" min="0" max="600" step="15" />
                        </div>
                        <div>
                            <label htmlFor="maxDuration">Max:</label>
                            <input id="maxDuration" name="maxDuration" type="range" min="0" max="600" step="15" />
                        </div>
                        <div id="durationOutput"></div>
                    </div>

                    <div className={styles.section}>
                        <h3>Bpm</h3>
                        <div>
                            <input id="bpmSlider" name="bpmSlider" type="range" min="0" max="200" step="20" />
                        </div>
                        <div id="bpmOutput"></div>
                    </div>
                </div>
            </SidebarContent>
        </Sidebar>
    )
}