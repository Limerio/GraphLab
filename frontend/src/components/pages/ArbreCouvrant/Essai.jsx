import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import GraphDisplay from './GraphDisplay';
import ValidationPopup from '../../common/ValidationPopup';
import RulesPopup from '../../common/RulesPopup';
import '../../../styles/pages/ArbreCouvrant/GlobalMode.css';
import config from '../../../config';

const TimerDisplay = React.memo(({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
});

const GraphDisplayMemo = memo(GraphDisplay);

const Essai = () => {

    const [graphs, setGraphs] = useState({
        petit: [],
        moyen: [],
        grand: []
    });
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const cyRef = useRef(null);
    const [showRules, setShowRules] = useState(false);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();
    const navigate = useNavigate();

    useEffect(() => {
        fetchGraphs();
    }, []);

    useEffect(() => {
        if (showRules) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showRules]);

    const difficultyLabels = {
        petit: 'Petit',
        moyen: 'Moyen',
        grand: 'Grand'
    };

    const handleGraphSelect = useCallback((event) => {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        if (!graphId) {
            setCurrentGraph(null);
            reset();
            return;
        }
        const fetchGraph = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph/${graphId}`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer les détails du graphe');
                }
                const graphConfig = await response.json();
                if (graphConfig?.data) {
                    graphConfig.data.nodes.forEach(node => {
                        if (node.position) {
                            node.position.y += 80;
                        }
                    });
                    graphConfig.data.edges.forEach(edge => {
                        if (edge.data) {
                            edge.data.controlPointDistance = edge.data.controlPointDistance ?? 0;
                        }
                    });
                    setCurrentGraph({
                        name: graphConfig.name,
                        data: graphConfig.data,
                        difficulty: graphConfig.difficulty
                    });
                    reset();
                    start();
                } else {
                    throw new Error('Données invalides pour le graphe');
                }
            } catch (err) {
                setError('Impossible de charger le graphe sélectionné');
                setCurrentGraph(null);
            }
        };
        fetchGraph();
    }, [reset, start]);

    const handleEdgeSelect = useCallback((edge) => {
        // TODO: Implement edge selection logic
    }, []);

    const validateGraph = useCallback(() => {
        // TODO: Implement validation logic
    }, []);

    const resetEdges = useCallback(() => {
        // TODO: Implement reset logic
    }, []);

    return (
        <div className="tree-mode-container">
            <button className="tree-mode-back-btn" onClick={() => navigate('/arbre-couvrant')}>&larr; Retour</button>
            <h2 className="tree-mode-title">Mode Essai</h2>
            <div className="tree-mode-top-bar">
                <select
                    className="tree-mode-select"
                    value={selectedGraph}
                    onChange={handleGraphSelect}
                    disabled={loading}
                >
                    <option value="" disabled hidden>
                        {loading ? "Chargement des graphes..." : "Veuillez choisir un graphe"}
                    </option>
                    {Object.entries(graphs).map(([difficulty, graphList]) => (
                        graphList.length > 0 && (
                            <optgroup key={difficulty} label={difficultyLabels[difficulty]}>
                                {graphList.map((graph) => (
                                    <option key={graph._id} value={graph._id}>
                                        {graph.name}
                                    </option>
                                ))}
                            </optgroup>
                        )
                    ))}
                </select>
                {error && <div className="tree-mode-error">{error}</div>}
                {currentGraph && <TimerDisplay time={time} formatTime={formatTime} />}
            </div>
            {currentGraph && <div className="tree-mode-buttons-row">
                <button className="tree-mode-btn tree-mode-btn-validate" onClick={validateGraph}>Valider l'arbre couvrant</button>
                <button className="tree-mode-btn tree-mode-btn-reset" onClick={resetEdges}>Réinitialiser la sélection</button>
            </div>}
            {currentGraph && <GraphDisplayMemo graphData={currentGraph} cyRef={cyRef} onSelectEdge={handleEdgeSelect} />}
            {currentGraph && (
                <div className="tree-mode-algos-solutions-container">
                    <span className="tree-mode-algos-solutions-title">Solutions selon les algorithmes :</span>
                    <div className="tree-mode-algos-solutions-btn-row">
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-prim"
                            onClick={() => {/* TODO: Afficher la solution de Prim */ }}
                        >
                            Solution selon l'algorithme de Prim
                        </button>
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-kruskal"
                            onClick={() => {/* TODO: Afficher la solution de Kruskal */ }}
                        >
                            Solution selon l'algorithme de Kruskal
                        </button>
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-boruvka"
                            onClick={() => {/* TODO: Afficher la solution de Boruvka */ }}
                        >
                            Solution selon l'algorithme de Boruvka
                        </button>
                    </div>
                </div>
            )}
            <button className="tree-mode-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
            {validationPopup && (
                <ValidationPopup
                    type={validationPopup.type}
                    title={validationPopup.title}
                    message={validationPopup.message}
                    onClose={handleClosePopup}
                />
            )}
            {showRules && (
                <RulesPopup title="Règles du mode Essai" onClose={() => setShowRules(false)}>
                    <h3>🎯 Objectif</h3>
                    <ul>
                    </ul>

                    <h3>🛠️ Comment jouer à l'arbre couvrant</h3>
                    <ul>
                    </ul>

                    <h3>🔧 Fonctionnalités</h3>
                    <ul>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );

    function fetchGraphs() {
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer la liste des graphes');
                }
                const data = await response.json();
                const sortedGraphs = {
                    petit: [],
                    moyen: [],
                    grand: []
                };
                data.forEach(graph => {

                    graph = {
                        ...graph,
                        name: graph.name.replace("Jeu", "Graphe")
                    }

                    const nodeCount = graph.data.nodes.length;
                    const edgeCount = graph.data.edges.length;

                    if (nodeCount <= 9 && edgeCount <= 9) {
                        sortedGraphs.petit.push(graph);
                    } else if (nodeCount <= 16 && edgeCount <= 16) {
                        sortedGraphs.moyen.push(graph);
                    } else {
                        sortedGraphs.grand.push(graph);
                    }
                });
                setGraphs(sortedGraphs);
                setLoading(false);
            } catch (err) {
                setError('Impossible de récupérer la liste des graphes');
                setLoading(false);
            }
        };
        fetchData();
    }

    function handleClosePopup() {
        setValidationPopup(null);
    }
};

const useTimer = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const start = () => setIsRunning(true);
    const stop = () => setIsRunning(false);
    const reset = () => {
        setTime(0);
        setIsRunning(false);
    };
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return { time, isRunning, start, stop, reset, formatTime };
};

export default Essai;