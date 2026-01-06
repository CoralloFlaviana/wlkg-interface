import React from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';

// AboutPage (ora come pagina completa a schermo intero)
const AboutPage = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f3f4f6',
            zIndex: 9999,
            overflow: 'auto',
            padding: '40px 20px'
        }}>
            {/* Header con bottone Back */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                marginBottom: '40px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: 'white',
                        color: '#4f46e5',
                        border: '2px solid #4f46e5',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#4f46e5';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateX(-4px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#4f46e5';
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.2)';
                    }}
                >
                    <ArrowLeft size={20} />
                    Back to Application
                </button>
            </div>

            {/* Contenuto About */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}
                    >
                        <BookOpen
                            style={{ width: '64px', height: '64px', color: '#4f46e5' }}
                        />
                    </div>
                    <h1
                        style={{
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '16px'
                        }}
                    >
                        World-Literature Knowledge Graph
                    </h1>
                </div>

                {/* About Section */}
                <Section
                    title="About the Project"
                    content="The World-Literature Knowledge Graph is a graph-based search platform conceived by Università degli Studi di Torino for the discovery of literatures from the world. Developed in the context of the PhD journey of Marco Antonio Stranisci, who was advised by Rossana Damiano and Viviana Patti, the project received two grants in the last two years."
                />

                {/* NGI-Search Initiative */}
                <div style={sectionStyle}>
                    <h2 style={titleStyle}>NGI-Search Initiative</h2>
                    <p style={textStyle}>
                        The project was granted 150,000 euros to improve the knowledge base and the usability of the visualization platform.
                    </p>
                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '12px'
                        }}
                    >
                        Team Members
                    </h3>
                    <TeamList
                        members={[
                            {
                                name: 'Rossana Damiano',
                                role: 'Principal investigator and responsible for WP 1 - IMP, Ethics Approval & Kick Off'
                            },
                            {
                                name: 'Marco Antonio Stranisci',
                                role: 'Project manager and responsible for WP 2 - Development of the MVP and Business Plan'
                            },
                            {
                                name: 'Eleonora Bernasconi',
                                role: 'Responsible for WP 3 - Completion of the Technology adoption Plan'
                            },
                            {
                                name: 'Viviana Patti & Stefano Ferilli',
                                role: 'Scientific support'
                            }
                        ]}
                    />
                </div>

                {/* UNITA Starting Grant */}
                <Section
                    title="UNITA Starting Grant: Connect Wonders"
                    content={
                        <>
                            <p style={textStyle}>
                                The project was granted 20,000 euros for the usage of the platform for the promotion of literary tourism in underrepresented European regions.
                            </p>
                            <p style={textStyle}>
                                The project involved a collaboration of Università degli Studi di Torino with Universitatea de Vest din Timișoara, Universitatea Transilvania din Brașov, and Université de Pau et des pays de l'Adour.
                            </p>
                        </>
                    }
                />

                {/* Actual Team */}
                <div style={sectionStyle}>
                    <h2 style={titleStyle}>Actual Team</h2>
                    <TeamList
                        members={[
                            {
                                name: 'Rossana Damiano',
                                role: 'Scientific Responsible'
                            },
                            {
                                name: 'Marco Antonio Stranisci',
                                role: 'Knowledge Graph'
                            },
                            {
                                name: 'Flaviana Corallo',
                                role: 'Visualization Platform'
                            }
                        ]}
                    />
                </div>

                {/* Footer */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '40px',
                        color: '#6b7280'
                    }}
                >
                    <p style={{ fontSize: '14px' }}>
                        © {new Date().getFullYear()} Università degli Studi di Torino
                    </p>
                </div>
            </div>
        </div>
    );
};

// Stili riutilizzabili
const sectionStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px'
};

const textStyle = {
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '16px'
};

// Componenti interni
const Section = ({ title, content }) => (
    <div style={sectionStyle}>
        <h2 style={titleStyle}>{title}</h2>
        <div style={textStyle}>{content}</div>
    </div>
);

const TeamList = ({ members }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {members.map((m, i) => (
            <div
                key={i}
                style={{ borderLeft: '4px solid #4f46e5', paddingLeft: '16px' }}
            >
                <p
                    style={{
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '4px'
                    }}
                >
                    {m.name}
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>{m.role}</p>
            </div>
        ))}
    </div>
);

export default AboutPage;