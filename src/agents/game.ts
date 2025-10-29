import { BaseAgent, AgentInput, AgentOutput } from './base';
import { memoryStore } from '../core/memoryStore';

/**
 * GameAgent - Implements game development
 */
export class GameAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('GameAgent', systemPrompt || 'You are a senior game developer...');
  }

  /**
   * Execute game development
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    const project = memoryStore.getCurrentProject();
    if (!project) {
      return {
        success: false,
        error: new Error('No active project'),
      };
    }

    try {
      const architecture = memoryStore.getArtifact(project.id, 'architecture');
      const requirements = memoryStore.getArtifact(project.id, 'requirements');

      // Generate game structure
      const gameStructure = await this.generateGameStructure(project);

      // Generate game scripts
      const gameScripts = await this.generateGameScripts(project, requirements);

      // Generate scenes
      const scenes = await this.generateScenes(project);

      // Generate game assets config
      const assetsConfig = await this.generateAssetsConfig(project);

      const gameArtifacts = {
        structure: gameStructure,
        scripts: gameScripts,
        scenes,
        assetsConfig,
        projectSettings: this.generateProjectSettings(project),
      };

      // Store artifacts
      memoryStore.storeArtifact(project.id, 'game', gameArtifacts);

      return {
        success: true,
        result: gameArtifacts,
        artifacts: gameArtifacts,
        message: 'Game development completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Generate game structure
   */
  private async generateGameStructure(project: any): Promise<any> {
    return {
      directories: [
        'Assets/Scripts/Core',
        'Assets/Scripts/Player',
        'Assets/Scripts/Enemies',
        'Assets/Scripts/UI',
        'Assets/Scripts/Managers',
        'Assets/Scenes',
        'Assets/Prefabs',
        'Assets/Materials',
        'Assets/Sprites',
        'Assets/Audio/Music',
        'Assets/Audio/SFX',
      ],
    };
  }

  /**
   * Generate game scripts
   */
  private async generateGameScripts(project: any, requirements: any): Promise<any[]> {
    return [
      {
        name: 'GameManager.cs',
        path: 'Assets/Scripts/Managers/GameManager.cs',
        code: this.generateGameManagerScript(),
      },
      {
        name: 'PlayerController.cs',
        path: 'Assets/Scripts/Player/PlayerController.cs',
        code: this.generatePlayerControllerScript(),
      },
      {
        name: 'ScoreManager.cs',
        path: 'Assets/Scripts/Managers/ScoreManager.cs',
        code: this.generateScoreManagerScript(),
      },
    ];
  }

  /**
   * Generate GameManager script
   */
  private generateGameManagerScript(): string {
    return `
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [SerializeField] private GameState currentState;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Start()
    {
        InitializeGame();
    }
    
    private void InitializeGame()
    {
        currentState = GameState.Menu;
        Debug.Log("Game Initialized");
    }
    
    public void StartGame()
    {
        currentState = GameState.Playing;
        Debug.Log("Game Started");
    }
    
    public void PauseGame()
    {
        currentState = GameState.Paused;
        Time.timeScale = 0f;
    }
    
    public void ResumeGame()
    {
        currentState = GameState.Playing;
        Time.timeScale = 1f;
    }
    
    public void GameOver()
    {
        currentState = GameState.GameOver;
        Debug.Log("Game Over");
    }
}

public enum GameState
{
    Menu,
    Playing,
    Paused,
    GameOver
}
`;
  }

  /**
   * Generate PlayerController script
   */
  private generatePlayerControllerScript(): string {
    return `
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float jumpForce = 10f;
    
    [Header("Ground Check")]
    [SerializeField] private Transform groundCheck;
    [SerializeField] private float groundCheckRadius = 0.2f;
    [SerializeField] private LayerMask groundLayer;
    
    private Rigidbody2D rb;
    private bool isGrounded;
    private float horizontalInput;
    
    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }
    
    private void Update()
    {
        HandleInput();
        CheckGround();
    }
    
    private void FixedUpdate()
    {
        Move();
    }
    
    private void HandleInput()
    {
        horizontalInput = Input.GetAxisRaw("Horizontal");
        
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            Jump();
        }
    }
    
    private void Move()
    {
        rb.velocity = new Vector2(horizontalInput * moveSpeed, rb.velocity.y);
    }
    
    private void Jump()
    {
        rb.velocity = new Vector2(rb.velocity.x, jumpForce);
    }
    
    private void CheckGround()
    {
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayer);
    }
}
`;
  }

  /**
   * Generate ScoreManager script
   */
  private generateScoreManagerScript(): string {
    return `
using UnityEngine;
using UnityEngine.UI;

public class ScoreManager : MonoBehaviour
{
    public static ScoreManager Instance { get; private set; }
    
    [SerializeField] private Text scoreText;
    private int currentScore = 0;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    public void AddScore(int points)
    {
        currentScore += points;
        UpdateScoreUI();
    }
    
    public int GetScore()
    {
        return currentScore;
    }
    
    public void ResetScore()
    {
        currentScore = 0;
        UpdateScoreUI();
    }
    
    private void UpdateScoreUI()
    {
        if (scoreText != null)
        {
            scoreText.text = "Score: " + currentScore;
        }
    }
}
`;
  }

  /**
   * Generate scenes
   */
  private async generateScenes(project: any): Promise<any[]> {
    return [
      {
        name: 'MainMenu',
        path: 'Assets/Scenes/MainMenu.unity',
        description: 'Main menu scene with start button and settings',
      },
      {
        name: 'GamePlay',
        path: 'Assets/Scenes/GamePlay.unity',
        description: 'Main gameplay scene',
      },
      {
        name: 'GameOver',
        path: 'Assets/Scenes/GameOver.unity',
        description: 'Game over screen with restart option',
      },
    ];
  }

  /**
   * Generate assets config
   */
  private async generateAssetsConfig(project: any): Promise<any> {
    return {
      sprites: [
        { name: 'player_idle', format: 'PNG', size: '64x64' },
        { name: 'player_run', format: 'PNG', size: '64x64' },
        { name: 'enemy_idle', format: 'PNG', size: '64x64' },
      ],
      audio: [
        { name: 'background_music', format: 'MP3' },
        { name: 'jump_sfx', format: 'WAV' },
        { name: 'collect_sfx', format: 'WAV' },
      ],
    };
  }

  /**
   * Generate project settings
   */
  private generateProjectSettings(project: any): any {
    return {
      unityVersion: '2022.3 LTS',
      platform: 'PC, Mac & Linux Standalone',
      scriptingBackend: 'Mono',
      apiCompatibilityLevel: '.NET Standard 2.1',
    };
  }
}

